# Service Provider Platform — Landing Site

A faithful, working rebuild of the uploaded `website.html`: one long marketing page for a marketplace and operations platform for service businesses. Every section, text, colour and interactive demo stays the same. The one addition is that the assistant section gives real AI answers.

## Who it's for
- **Customers** looking for a local cleaner, repair person or tutor in the pilot area (Peterborough and the Fens).
- **Service business owners** deciding whether to list their business and run rotas, evidence, invoicing and payroll on the platform.
- **You, the owner**: a polished page to show to pilot businesses and early users.

## Core features and experience
Built to match the file exactly, in the same order:
- **Header**: logo, links that scroll to each section (Find services, For businesses, Demand map, Apps, Categories, Pricing), plus "Log in" and "Try the demo".
- **Hero**: "Find local pros, run your business, all in one place", with animated icons and two buttons.
- **Discover map**: pick a service (Cleaning, Home repairs, Tutoring) and a place (Crowland, Peterborough, Stamford, Wisbech). The map and the "nearest eligible first" list update with sample businesses.
- **Product preview**: a mock business workspace with clickable tabs (Overview, Rota, Bookings, Disputes, Payroll, Analytics, Training).
- **"That group chat" section**: a searchable strip of example cards ("oven", "invoice", "rota", "training").
- **Feature grid**: six interactive cards: booking and pricing picker, rota gap filling, a before/after photo slider, an invoice and credit-note slider, payroll selection, and an analytics bar chart.
- **AI assistant (live)**: the sample question buttons stay. Visitors can also type their own question. Answers appear word by word, and the AI only talks about the platform as the page describes it.
- **Categories**: Cleaning, Home repairs and Tutoring, each with its own way of working.
- **Demand map, Pricing and estimator**: kept exactly as they are in the file.
- **Quote, Commercial, Apps** (tabs for Pro app, Customer app, Business workspace and Admin panel, with phone mock-ups), **final call to action**, **footer** and **cookie notice**.
- **Light and dark mode**, following the visitor's device setting, as the file already does.

## User flow
1. A visitor lands on the hero and either scrolls or taps a link in the header.
2. They try the Discover map by picking a service and a town to see nearby sample businesses.
3. They click through the product preview and the feature cards.
4. They ask the assistant a sample question or type their own, and get a live answer.
5. They press "Try the demo" or "Log in". These open the prototype once you send that file (see the phases below).

## UI/UX feel
The same look as the file: soft grey panels on white, centred headlines, product screens drawn in HTML, a vibrant orange brand colour (#F05D23), and the Plus Jakarta Sans and Roboto fonts. Motion is gentle (floating icons, a blinking search cursor, a scrolling strip, a typing indicator) and is turned down for visitors who prefer less motion. The page works on phones as well as desktops.

## Implementation phases
**Phase 1 — MVP (built now)**
- A complete, matching rebuild of every section and every interactive demo in the file.
- A live AI assistant with a typed question box and the sample questions, giving word-by-word answers about the platform. Each visitor's conversation is remembered while they stay on the page.
- "Log in" and "Try the demo" stay in place but point to a temporary "Demo arriving soon" note until the prototype file arrives.

**Phase 2**
- Add the prototype page you will send, and connect "Log in" and "Try the demo" to it.
- A simple view for you to read the questions visitors ask the assistant.

**Phase 3**
- Turn "List your business" into a real sign-up or waitlist.
- Make the pricing, categories and sample businesses editable without touching code.

## Assumptions
- "Match it exactly" means all wording, layout, colours, fonts and demo behaviour copied as they are. Sample businesses and numbers stay as illustrations.
- The assistant uses Claude Sonnet 5.5, paid from your Emergent universal AI credits, so you don't need your own key. Each answer uses a small amount of credit.
- The assistant only answers questions about this platform, using the page's content. It politely declines anything else, and it never claims to read a real workspace.
- Visitors don't need an account to use the assistant. Conversations are stored, but this phase includes no screen to view them.
- Until the prototype file arrives, "Log in" and "Try the demo" show a short "Demo arriving soon" message.
- The cookie notice works as it does in the file. The browser remembers when a visitor dismisses it, and no tracking is added.
- The footer's Privacy, Terms and Cookies links stay as placeholders, just as they are in the file.
