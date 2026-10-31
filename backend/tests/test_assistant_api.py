# Assistant chat SSE endpoint tests
import os
import json
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
URL = f"{BASE_URL}/api/assistant/chat"


def chat(sid, msg):
    r = requests.post(URL, json={"session_id": sid, "message": msg}, stream=True, timeout=90)
    assert r.status_code == 200, r.text
    assert "text/event-stream" in r.headers.get("content-type", "")
    events = []
    for line in r.iter_lines(decode_unicode=True):
        if line and line.startswith("data:"):
            events.append(json.loads(line[5:]))
    return events


def text_of(events):
    return "".join(e.get("t", "") for e in events)


# Health
def test_root():
    r = requests.get(f"{BASE_URL}/api/", timeout=20)
    assert r.status_code == 200 and r.json()["message"] == "ok"


# Validation
@pytest.mark.parametrize("payload", [
    {"session_id": "TEST_x", "message": ""},
    {"session_id": "TEST_x", "message": "a" * 501},
    {"session_id": "", "message": "hi"},
    {"message": "hi"},
])
def test_validation_422(payload):
    r = requests.post(URL, json=payload, timeout=20)
    assert r.status_code == 422


# Streaming + done
def test_stream_basic():
    ev = chat(f"TEST_{uuid.uuid4()}", "What is the Team plan price?")
    assert ev[-1] == {"done": True}
    assert not any("error" in e for e in ev), ev
    assert len([e for e in ev if "t" in e]) > 1  # multiple chunks
    txt = text_of(ev)
    print("ANSWER1:", txt)
    assert len(txt) > 20


# Context memory
def test_followup_context():
    sid = f"TEST_{uuid.uuid4()}"
    ev1 = chat(sid, "What is the Team plan price?")
    ev2 = chat(sid, "And how many pros does it include?")
    t2 = text_of(ev2)
    print("ANSWER1:", text_of(ev1))
    print("ANSWER2:", t2)
    assert ev2[-1] == {"done": True}
    assert "team" in t2.lower()


# Off-topic decline
def test_offtopic():
    ev = chat(f"TEST_{uuid.uuid4()}", "Write me a poem about the French revolution")
    t = text_of(ev)
    print("OFFTOPIC:", t)
    assert ev[-1] == {"done": True}
    assert "revolution" not in t.lower() or any(w in t.lower() for w in ["can't", "cannot", "only", "platform"])
