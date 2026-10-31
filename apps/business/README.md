# Business platform

The workspace for service businesses on the Relio, exactly as designed: rota, bookings, quality review, disputes, pricing, payroll, finance, marketplace listings, analytics, people, training, campaigns, integrations and settings, plus the assistant.

## What's in it

| Group | Section | What's in it |
|---|---|---|
| | Sign in and sign up | Log in with two-step verification, create a business, onboarding and verification for new businesses |
| Operations | Overview | Today's numbers, what needs attention, today's work, latest updates |
| | Rota | Weekly rota, allocate and publish, cover requests and swaps, notice periods |
| | Bookings | Bookings and requests |
| | Quality | Evidence review with before and after photos for each task |
| | Disputes | Concerns and disputes through to resolution |
| Money | Pricing | Price lists, pricing models, discounts and offers, change requests |
| | Payroll | Pay periods, exceptions, payroll reports (weekly, monthly, tax year) |
| | Finance | Invoices, payments and cash |
| Marketplace | Listings and profile | Services listed on the marketplace, business profile and portfolio |
| | Demand map | Where customers are searching |
| Insights | Analytics | Margins, capacity and trends |
| People and clients | Employee management | Pros, invites, verification, documents and expiry, employee details |
| | Clientele management | Clients, sites and contracts |
| | Training and development | Courses, records and refreshers |
| Growth | Campaigns | Campaign list and the new campaign wizard |
| | Integrations | Ads, email and review platforms |
| Business | Settings | Business details, team and roles, notices, security and more |
| | Assistant | "Ask assistant" button on every page |

## Run it

You need Node 18 or later. There's nothing to install.

```bash
npm start            # http://localhost:3002
```

Or open the folder with any static web server. **Reset demo data** in the top bar puts the sample data back.

### Demo sign-in

| Who | Email | Password | Two-step code |
|---|---|---|---|
| Business owner, Fenland Fresh Cleaning | `dami.cole@fenlandfresh.example` | `Clean2026!` | `482913` |

The sign-in screen has a **Demo accounts** panel with a button to fill these in. **Sign up** walks through setting up a new business, which starts with an empty workspace and the verification steps.

## How the code is organised

```
index.html            loads the stylesheet and the scripts in order
css/styles.css        the design's stylesheet (colours, type, components, light and dark)
js/00-config.js       settings: demo or API mode, API address
js/00-data-store.js   the data layer: where the screens' data comes from and where changes go
js/NN-<section>.js    the screens and logic, one file per section of the design, in load order
js/zz-start.js        start-up: routes every action through the data layer
server.mjs            small local server (no dependencies)
scripts/check.mjs     checks every script parses
```

The code is the design's own code, so every page, button, form, message and flow is the same as the prototype. It contains only what this app's screens use. Files named `NN-shared-...` hold code from another part of the platform that these screens also call, such as task checklists, pricing rules or document expiry.

How it works: every screen is a function that returns HTML from one state object (`S`). Buttons carry `data-act="name"`, and each name maps to a function in an `ACT` registry that changes `S`; the page then re-renders. Pop-ups work the same way through `MODALS`.

## Connect it to the API

Right now it runs in **demo mode**: it starts from the sample data in the design and saves changes in your browser.

All reading and writing goes through `js/00-data-store.js`:

- `load()` returns the state the screens draw from. In API mode, fetch it from the API (or fetch per section and build it up).
- `save(state)` is called after every change.
- `action(name, data, state)` is called after every button or form action with its name and data, for example `("biz", { v: "quality" })`. In API mode, send each one to the matching endpoint.

Set `mode: "api"` and `apiUrl` in `js/00-config.js` once that's implemented. The screens don't need to change. Until then, every change stays in the browser it was made in, and the customer, business and admin apps don't see each other's changes.

The design runs on a fixed demo clock (Thursday 15 October 2026, 12:40) so the sample data always lines up. `clock()` in `js/01-time-format-helpers.js` is the one place to switch to real time once real data is connected.

## Deploy

It's a static site: upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, S3 + CloudFront, or your own server). There's no build step.

## Checks

```bash
npm run check        # every script parses
```

## Updating from the design

These files are generated from the design file by the build tools (in the separate `design-build-tools` folder). If the design changes, run `python3 build.py <design.html> <folder>` to regenerate all three platforms. Your edits to `README.md` are kept; edits elsewhere are replaced, so once you start changing the code by hand, stop regenerating.

## Demo-only parts

Some parts stand in for services that need a provider: payments, emails, texts, sign-in links, identity checks and photo storage are simulated, and sample photos stand in for real ones. They're labelled **Demo** on screen.
