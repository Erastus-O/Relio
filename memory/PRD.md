# PRD — Service Provider Platform landing site

## Original problem
"Implement this site for me" — uploaded website.html (marketing page for a marketplace + operations platform for service businesses, pilot in Peterborough and the Fens).

## Architecture
- Source HTML kept verbatim in /app/scripts/site/site.html; `transform.py` adds the live assistant form/CSS/JS (extra.html) and writes /app/frontend/public/site.html.
- React App.js fetches /site.html, mounts styles + markup, runs its scripts.
- /platform-prototype.html = "Demo arriving soon" placeholder (all Log in / Try the demo / plan links).
- FastAPI POST /api/assistant/chat → SSE stream, Claude Sonnet 5.5 (Emergent key), system prompt = page text (backend/site_context.txt); messages stored in Mongo `assistant_messages`.

## Implemented (June 2026)
- Faithful rebuild of all sections and interactive demos, light/dark, cookie notice (hidden fix).
- Live AI assistant: typed questions, streaming answers, per-visit memory; new session when a sample question is clicked.

## Backlog
- P1: Add the prototype page; connect Log in / Try the demo.
- P1: Owner view of assistant questions.
- P2: Real business sign-up/waitlist; editable pricing/categories/sample businesses; rate limit the assistant.
- Note: the estimator script exists in the source file but its form markup isn't in the file, so it doesn't appear.
