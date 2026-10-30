# Relio

[![CI](https://github.com/Erastus-O/Relio/actions/workflows/ci.yml/badge.svg)](https://github.com/Erastus-O/Relio/actions/workflows/ci.yml)

**Live site:** https://erastus-o.github.io/Relio/ (website) · https://erastus-o.github.io/Relio/platform-prototype.html (clickable prototype)

Relio is a marketplace and operating system for service businesses. This is the codebase for the platform shown in the prototype: the public website, the customer booking app, the business workspace, the admin panel, the Pro mobile app, and the API behind them.

```
apps/
  api/      Node + Express + Prisma (PostgreSQL). One API for every surface.
  web/      Next.js 14. Website, customer booking, business workspace, admin panel.
  pro/      Expo (React Native) Pro app for iOS and Android.
packages/
  shared/   TypeScript used by all three: plans and fees, task checklists,
            pricing, document expiry rules, payroll helpers.
prototype/  The clickable HTML prototype and website this code was built from.
```

## Run it locally

You need Node 20+, Docker (for PostgreSQL) and, for the Pro app, the Expo Go app on your phone or an iOS/Android simulator.

```bash
# 1. Install
npm install                       # api, web and shared
cd apps/pro && npm install && cd ../..

# 2. Database
cp apps/api/.env.example apps/api/.env
npm run db:up                     # starts PostgreSQL in Docker
npm run db:migrate                # creates the tables
npm run db:seed                   # demo data (see below)

# 3. Start everything (three terminals)
npm run dev:api                   # http://localhost:4000
cp apps/web/.env.example apps/web/.env.local && npm run dev:web    # http://localhost:3000
npm run dev:pro                   # scan the QR code with Expo Go
```

The Pro app reads the API address from `apps/pro/app.json` → `expo.extra.apiUrl`. On a real phone, change `localhost` to your computer's local IP address.

### Demo sign-ins

Everyone signs in with an email and a 6-digit code. In development the API prints the code in its terminal and also returns it to the sign-in screen.

| Who | Email | What to try |
|---|---|---|
| Business owner | `dami.cole@fenlandfresh.example` | Quality review with before and after photos, pros and documents, payroll reports, campaigns |
| Pro | `grace.adeyemi@mail.example` | Business list after sign-in, home earnings and withdraw, jobs with task photos, documents and renewals, training |
| Customer | `amara.okafor@mail.example` | Book a deep clean with the task checklist and before photos, view the visit report |
| Admin | `ops@relio.example` | Platform totals, suspend a business, dispute D-301 with its booking evidence |

Tomasz Nowak is seeded as inactive (photo ID expired more than 5 days ago), and Tom Okoro as an invited pro.

## How the main features map to the code

| Feature | Where |
|---|---|
| Plans, prices, marketplace fees, feature limits | `packages/shared/src/plans.ts`, enforced by `requireFeature` in `apps/api/src/lib/auth.ts` |
| Service task checklists (all ticked by default, add and remove, up to a maximum) | `packages/shared/src/tasks.ts`, `apps/web/app/book/[serviceId]/page.tsx`, `POST /customer/bookings` |
| Customer before photos and photo permission | `POST /customer/photos`, `Booking.photoPermission`, `apps/web/app/book/[serviceId]/page.tsx` |
| Before and after photo for every task | `apps/api/src/lib/visits.ts`, `apps/web/components/BeforeAfter.tsx`, `apps/pro/app/job/[id].tsx` |
| Pro sign-in by email, list of businesses that added them | `apps/api/src/routes/auth.ts`, `GET /pro/businesses`, `apps/pro/app/(auth)/` |
| Pro onboarding and verification by the business | `apps/pro/app/onboarding.tsx`, `POST /business/:id/pros/:proId/documents/:docId/verify` |
| Document expiry, renewal, 5-day grace, inactive pros | `packages/shared/src/documents.ts`, `apps/api/src/jobs/documents.ts`, `apps/pro/app/(tabs)/profile.tsx`, allocation checks in `routes/business.ts` |
| Pro home: earnings, next pay, withdraw | `GET /pro/:proId/home`, `/wallet`, `/withdrawals`, `apps/pro/app/(tabs)/index.tsx`, `apps/pro/app/withdraw.tsx` |
| Training to do (new or refresher) | `GET /pro/:proId/training`, `apps/pro/app/(tabs)/training.tsx` |
| Quality review | `GET /business/:id/quality/queue`, `POST /business/:id/visits/:visitId/review` |
| Payroll reports (weekly, monthly, tax year, CSV) | `GET /business/:id/payroll/report`, `apps/web/app/business/payroll/page.tsx` |
| Offers and campaigns | `routes/business.ts` (`/offers`, `/campaigns`, `/integrations`) |
| Admin: overview, businesses, disputes, evidence after 5 days | `apps/api/src/routes/admin.ts`, `apps/web/app/admin/` |
| Access to photos and documents | `apps/api/src/routes/files.ts` checks the customer, business members, allocated pros and admins |

## Deployment

- **Website and prototype** are published to GitHub Pages by `.github/workflows/pages.yml` on every push that touches `prototype/`. `prototype/website.html` becomes the site's `index.html`. If the first run fails at "configure-pages", open the repository's **Settings → Pages**, set **Source** to **GitHub Actions**, and re-run the workflow.
- **CI** (`.github/workflows/ci.yml`) starts PostgreSQL, applies the migrations in `apps/api/prisma/migrations`, seeds the demo data, then runs the typecheck, tests and the Next.js build.
- **API and web app** need a Node host and PostgreSQL (for example Render, Railway or Fly.io). Set `DATABASE_URL`, `JWT_SECRET` and `CORS_ORIGINS` on the API, run `npx -w @relio/api prisma migrate deploy`, then `npm start -w @relio/api`. Point the web app at it with `NEXT_PUBLIC_API_URL` and run `npx next build && npx next start` in `apps/web`.

## Checks

```bash
npm run typecheck        # shared, api, web
npm test                 # shared rules (tasks, pricing, documents, fees, payroll) and API smoke test
cd apps/web && npx next build
cd apps/pro && npx tsc --noEmit && npx expo export --platform android
```

## Before going live

This is a working starting point, not a finished product. These parts are stubbed and need a real provider or more work:

- **Payments and payouts**: card payments, the 30-day trials, subscriptions and pro withdrawals are recorded but not charged. Connect a provider such as Stripe (Connect for payouts) where `routes/customer.ts`, `routes/business.ts` (`/plan`) and `routes/pro.ts` (`/withdrawals`, `/payout-accounts`) say so.
- **Email, text and push**: `apps/api/src/lib/notify.ts` prints to the console.
- **File storage**: `apps/api/src/lib/storage.ts` writes to disk. Use S3 or similar, scan uploads and strip location data from customer-visible photos.
- **Campaign and ads integrations**: connections are recorded but don't use each provider's OAuth yet.
- **Rota building, cover requests and swaps, invoicing, analytics, the AI assistant and the demand map** exist in the prototype but only partly in the API. They're the next things to build.
- **Pro app offline mode**: the prototype queues check-ins and photos offline. The app here needs a connection.
- **Security review**: add rate limiting on `/auth/code`, encrypt `Site.accessSecret` at rest, and review every role permission before launch.
