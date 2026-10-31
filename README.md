# Relio

[![CI](https://github.com/Erastus-O/Relio/actions/workflows/ci.yml/badge.svg)](https://github.com/Erastus-O/Relio/actions/workflows/ci.yml)

**Live:** [website](https://erastus-o.github.io/Relio/) · [customer app](https://erastus-o.github.io/Relio/customer/) · [business app](https://erastus-o.github.io/Relio/business/) · [admin panel](https://erastus-o.github.io/Relio/admin/) · [clickable prototype](https://erastus-o.github.io/Relio/demo.html)

Relio is a marketplace and operating system for service businesses. This is the codebase for the platform shown in the prototype: the public website, the customer booking app, the business workspace, the admin panel, the Pro mobile app, and the API behind them.

```
apps/
  website/   Next.js 14. Public website, from the design in
             prototype/website.html, plus contact and the demo.          :3000
  customer/  Customer app, from the design: discovery and the map,
             booking, bookings, quotes, providers, payments, support.    :3001
  business/  Business app, from the design: rota, bookings, quality,
             disputes, pricing, payroll, finance, listings, demand map,
             analytics, people, clients, training, campaigns, settings.  :3002
  admin/     Admin panel, from the design: overview, businesses and
             verification, disputes, listings, reports, categories,
             data health, tenant access, audit, settings.                :3003
  pro/       Expo (React Native). Pro app for iOS and Android.
  api/       Node + Express + Prisma (PostgreSQL). The platform API.     :4000
packages/
  shared/    TypeScript used by the API, website and Pro app: plans and
             fees, task checklists, pricing, document expiry, payroll.
prototype/   The clickable HTML prototype and website the apps come from.
```

## Run it locally

You need Node 22+.

```bash
npm install
npm run dev:web                   # website and the three apps, or one at a time:
                                  #   npm run dev:website   http://localhost:3000
                                  #   npm run dev:customer  http://localhost:3001
                                  #   npm run dev:business  http://localhost:3002
                                  #   npm run dev:admin     http://localhost:3003
```

That's all the website and the three apps need: the apps run in **demo mode** on the sample data from the design and save changes in your browser. **Reset demo data** in each app's top bar puts the sample data back.

### Demo sign-ins

Each app's sign-in screen has a **Demo accounts** panel that fills these in.

| App | Email | Password | Two-step code |
|---|---|---|---|
| Customer | `amara.okafor@example.com` (home) or `sam.ellis@harbour-logistics.example` (business client) | `Clean2026!` | |
| Business | `dami.cole@fenlandfresh.example` (Fenland Fresh Cleaning) | `Clean2026!` | `482913` |
| Admin | `ops@relio.example` | `Clean2026!` | `482913` |

### The website

The website's design lives in `apps/website/site/` as the original HTML (`markup.html`), CSS (`site.css`) and JavaScript (`site.js`) from `prototype/website.html`, with its photos in `apps/website/site/img/`. Edit those files to change the page. `apps/website/app/site.ts` points the design's buttons at the apps (Log in → customer app, List your business and the plan buttons → business app, Try the demo → the prototype at `/demo.html`) and stops the build if a button is left unmapped. The app addresses come from `NEXT_PUBLIC_CUSTOMER_URL`, `NEXT_PUBLIC_BUSINESS_URL` and `NEXT_PUBLIC_ADMIN_URL` (defaults: the local ports above).

### The customer, business and admin apps

Each is the design's own code with no build step: `index.html` loads `css/styles.css` and the scripts in `js/` in order, one file per section of the design. Every screen is a function that returns HTML from one state object, buttons carry `data-act="name"`, and each name maps to a function in an `ACT` registry. Each app's own `README.md` has the full section list.

All reading and writing goes through `js/00-data-store.js` (`load`, `save` and `action`), and `js/00-config.js` switches between `mode: "demo"` and `mode: "api"`. Until the API is connected there, each app keeps its changes in the browser it was used in, so the customer, business and admin apps don't see each other's changes. The design runs on a fixed demo clock (Thursday 15 October 2026, 12:40); `clock()` in `js/01-time-format-helpers.js` switches it to real time.

### The API and Pro app

The API and Pro app are the next step for going live. They need Docker (for PostgreSQL) and, for the Pro app, Expo Go on your phone or a simulator.

```bash
cp apps/api/.env.example apps/api/.env
npm run db:up                     # starts PostgreSQL in Docker
npm run db:migrate                # creates the tables
npm run db:seed                   # demo data
npm run dev:api                   # http://localhost:4000
cd apps/pro && npm install && npx expo start
```

The Pro app reads the API address from `apps/pro/app.json` → `expo.extra.apiUrl`. On a real phone, change `localhost` to your computer's local IP address. API demo sign-ins use an emailed 6-digit code, which the API prints in development: `grace.adeyemi@mail.example` (pro), `dami.cole@fenlandfresh.example`, `amara.okafor@mail.example` and `ops@relio.example`.

## How the API's features map to the code

The screens for all of these are in the customer, business and admin apps; this is where the API implements them.


| Feature | Where |
|---|---|
| Plans, prices, marketplace fees, feature limits | `packages/shared/src/plans.ts`, enforced by `requireFeature` in `apps/api/src/lib/auth.ts` |
| Service task checklists (all ticked by default, add and remove, up to a maximum) | `packages/shared/src/tasks.ts`, `POST /customer/bookings` |
| Customer before photos and photo permission | `POST /customer/photos`, `Booking.photoPermission` |
| Before and after photo for every task | `apps/api/src/lib/visits.ts`, `apps/pro/app/job/[id].tsx` |
| Pro sign-in by email, list of businesses that added them | `apps/api/src/routes/auth.ts`, `GET /pro/businesses`, `apps/pro/app/(auth)/` |
| Pro onboarding and verification by the business | `apps/pro/app/onboarding.tsx`, `POST /business/:id/pros/:proId/documents/:docId/verify` |
| Document expiry, renewal, 5-day grace, inactive pros | `packages/shared/src/documents.ts`, `apps/api/src/jobs/documents.ts`, `apps/pro/app/(tabs)/profile.tsx`, allocation checks in `routes/business.ts` |
| Pro home: earnings, next pay, withdraw | `GET /pro/:proId/home`, `/wallet`, `/withdrawals`, `apps/pro/app/(tabs)/index.tsx`, `apps/pro/app/withdraw.tsx` |
| Training to do (new or refresher) | `GET /pro/:proId/training`, `apps/pro/app/(tabs)/training.tsx` |
| Quality review | `GET /business/:id/quality/queue`, `POST /business/:id/visits/:visitId/review` |
| Payroll reports (weekly, monthly, tax year, CSV) | `GET /business/:id/payroll/report` |
| Offers and campaigns | `routes/business.ts` (`/offers`, `/campaigns`, `/integrations`) |
| Admin: overview, businesses, disputes, evidence after 5 days | `apps/api/src/routes/admin.ts` |
| Access to photos and documents | `apps/api/src/routes/files.ts` checks the customer, business members, allocated pros and admins |

## Deployment

- **GitHub Pages** (`.github/workflows/pages.yml`) publishes the website at `/`, the customer, business and admin apps at `/customer/`, `/business/` and `/admin/`, and the prototype at `/demo.html`, on every push that changes them. The website is exported as static files (`npm run export -w @relio/website`) and the three apps are copied as they are.
- **CI** (`.github/workflows/ci.yml`) starts PostgreSQL, applies the migrations in `apps/api/prisma/migrations`, seeds the demo data, then runs the typecheck and tests, checks every script in the three apps parses, and builds the website.
- **API** needs a Node host and PostgreSQL (for example Render, Railway or Fly.io). Set `DATABASE_URL`, `JWT_SECRET` and `CORS_ORIGINS` (the address of every web app), run `npx -w @relio/api prisma migrate deploy`, then `npm start -w @relio/api`.
- **Own domains**: the three apps are static folders, so any static host works (Netlify, Vercel, Cloudflare Pages, S3): upload `index.html`, `css/` and `js/`. The website runs on Vercel with the root directory `apps/website`, or anywhere as static files from `npm run export -w @relio/website`. Set the `NEXT_PUBLIC_*_URL` variables to the apps' addresses (for example `app.relio.com`, `business.relio.com`, `admin.relio.com`).
- **Pro app** builds with Expo's EAS (`npx eas build`) for the App Store and Google Play. Set `expo.extra.apiUrl` in `apps/pro/app.json` to the live API.

## Checks

```bash
npm run typecheck        # shared, api and website
npm test                 # shared rules (tasks, pricing, documents, fees, payroll) and API smoke test
npm run check:apps       # every script in the customer, business and admin apps parses
npm run build:web        # production build of the website
cd apps/pro && npx tsc --noEmit && npx expo export --platform android
```

## Before going live

This is a working starting point, not a finished product. These parts are stubbed and need a real provider or more work:

- **Connect the apps to the API**: implement `mode: "api"` in each app's `js/00-data-store.js` so the customer, business and admin apps share live data instead of each keeping demo data in the browser.
- **Demo-only parts in the apps**: payments, emails, texts, sign-in links, identity checks and photo storage are simulated there and labelled **Demo** on screen.

- **Payments and payouts**: card payments, the 30-day trials, subscriptions and pro withdrawals are recorded but not charged. Connect a provider such as Stripe (Connect for payouts) where `routes/customer.ts`, `routes/business.ts` (`/plan`) and `routes/pro.ts` (`/withdrawals`, `/payout-accounts`) say so.
- **Email, text and push**: `apps/api/src/lib/notify.ts` prints to the console.
- **File storage**: `apps/api/src/lib/storage.ts` writes to disk. Use S3 or similar, scan uploads and strip location data from customer-visible photos.
- **Campaign and ads integrations**: connections are recorded but don't use each provider's OAuth yet.
- **Rota building, cover requests and swaps, invoicing, analytics, the AI assistant and the demand map** exist in the prototype but only partly in the API. They're the next things to build.
- **Pro app offline mode**: the prototype queues check-ins and photos offline. The app here needs a connection.
- **Security review**: add rate limiting on `/auth/code`, encrypt `Site.accessSecret` at rest, and review every role permission before launch.
