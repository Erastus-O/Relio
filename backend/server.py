import os
import json
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Annotated, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]
LLM_KEY = os.environ["EMERGENT_LLM_KEY"]
SITE_TEXT = (ROOT_DIR / "site_context.txt").read_text()

SYSTEM = f"""You are the website assistant for "Service Provider Platform", a marketplace and operations platform for service businesses, piloting in Peterborough and the Fens (cleaning, home repairs, tutoring).
Answer visitor questions ONLY about this platform, using the website content below. If something is not covered, say so plainly and suggest trying the demo or contacting the team. Politely decline unrelated topics.
You cannot see any real workspace, customer, booking or account data; never pretend to. Example names and figures on the page are illustrations.
Style: UK English, friendly and concise (under 120 words), short paragraphs or "- " bullet lists, **bold** for key facts. No headings, no tables.

WEBSITE CONTENT:
{SITE_TEXT}"""

PyObjectId = Annotated[str, BeforeValidator(str)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self):
        return self.model_dump(by_alias=True, exclude_none=True)

    @classmethod
    def from_mongo(cls, doc):
        return cls(**doc)


class ChatMessage(BaseDocument):
    session_id: str
    role: str
    text: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ChatIn(BaseModel):
    session_id: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1, max_length=500)


app = FastAPI()
api = APIRouter(prefix="/api")


@api.get("/")
async def root():
    return {"message": "ok"}


@api.post("/assistant/chat")
async def assistant_chat(body: ChatIn):
    docs = await db.assistant_messages.find({"session_id": body.session_id}).sort("created_at", -1).limit(12).to_list(12)
    history = [ChatMessage.from_mongo(d) for d in reversed(docs)]
    prompt = body.message
    if history:
        transcript = "\n".join(f"{'Visitor' if m.role == 'user' else 'Assistant'}: {m.text}" for m in history)
        prompt = f"Conversation so far:\n{transcript}\n\nVisitor's new question: {body.message}"
    await db.assistant_messages.insert_one(ChatMessage(session_id=body.session_id, role="user", text=body.message).to_mongo())

    chat = LlmChat(api_key=LLM_KEY, session_id=body.session_id, system_message=SYSTEM).with_model("anthropic", "claude-sonnet-5-5")

    async def gen():
        out = ""
        try:
            async for ev in chat.stream_message(UserMessage(text=prompt)):
                if isinstance(ev, TextDelta):
                    out += ev.content
                    yield f"data: {json.dumps({'t': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logging.exception("assistant error")
            yield f"data: {json.dumps({'error': 'failed'})}\n\n"
        if out:
            await db.assistant_messages.insert_one(ChatMessage(session_id=body.session_id, role="assistant", text=out).to_mongo())
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown():
    client.close()
