# Relio

[![CI](https://github.com/Erastus-O/Relio/actions/workflows/ci.yml/badge.svg)](https://github.com/Erastus-O/Relio/actions/workflows/ci.yml)

**Live site:** https://erastus-o.github.io/Relio/ (website) · https://erastus-o.github.io/Relio/platform-prototype.html (clickable prototype)

Relio is a marketplace and operating system for service businesses. This is the codebase for the platform shown in the prototype: the public website, the customer booking app, the business workspace, the admin panel, the Pro mobile app, and the API behind them.

```
apps/
  website/   Next.js 14. Public website from the design in
             prototype/website.html, plus contact and the demo.          :3000
  customer/  Next.js 14. Customer app: find and book services, bookings,
             visit reports with before and after photos.                 :3001
  business/  Next.js 14. Business app: overview, quality review, pros and
             documents, payroll reports, campaigns, business sign-up.    :3002
  admin/     Next.js 14. Admin panel: platform totals, businesses,
             disputes and booking evidence.                              :3003
  pro/       Expo (React Native). Pro app for iOS and Android.
  api/       Node + Express + Prisma (PostgreSQL). One API for every app. :4000
packages/
  shared/    TypeScript used by every app and the API: plans and fees, task
             checklists, pricing, document expiry rules, payroll helpers.
  web-ui/    Code the four web apps share: API client, email-code sign-in,
             app shell, before/after photo evidence, styles, app URLs.
prototype/  The clickable HTML prototype and website this code was built from.
```

## Run it locally

You need Node 22+, Docker (for PostgreSQL) and, for the Pro app, the Expo Go app on your phone or an iOS/Android simulator.

```bash
# 1. Install
npm install                       # api, the four web apps and the shared packages
cd apps/pro && npm install && cd ../..

# 2. Database
cp apps/api/.env.example apps/api/.env
npm run db:up                     # starts PostgreSQL in Docker
npm run db:migrate                # creates the tables
npm run db:seed                   # demo data (see below)

# 3. Start everything (three terminals)
npm run dev:api                   # http://localhost:4000
npm run dev:web                   # all four web apps, or one at a time:
                                  #   npm run dev:website   http://localhost:3000
                                  #   npm run dev:customer  http://localhost:3001
                                  #   npm run dev:business  http://localhost:3002
                                  #   npm run dev:admin     http://localhost:3003
npm run dev:pro                   # scan the QR code with Expo Go
```

The website's design lives in `apps/website/site/` as the original HTML (`markup.html`), CSS (`site.css`) and JavaScript (`site.js`) from `prototype/website.html`, with its photos in `apps/website/public/img/`. Edit those files to change the page. `apps/website/app/site.ts` points the design's buttons at the real apps (Log in → customer app, List your business and plan buttons → business sign-up, Try the demo → the clickable prototype at `/demo.html`) and stops the build if a button is left unmapped.

Each web app is its own Next.js project with its own sign-in at `/login`, so you can run, build and deploy them separately. They find the API and each other through `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WEBSITE_URL`, `NEXT_PUBLIC_CUSTOMER_URL`, `NEXT_PUBLIC_BUSINESS_URL` and `NEXT_PUBLIC_ADMIN_URL` (see each app's `.env.example`; the defaults are the local ports above). The API must list every web app's address in `CORS_ORIGINS`.

The Pro app reads the API address from `apps/pro/app.json` → `expo.extra.apiUrl`. On a real phone, change `localhost` to your computer's local IP address.

### Demo sign-ins

Everyone signs in with an email and a 6-digit code. In development the API prints the code in its terminal and also returns it to the sign-in screen.

| App | Email | What to try |
|---|---|---|
| Business (:3002) | `dami.cole@fenlandfresh.example` | Quality review with before and after photos, pros and documents, payroll reports, campaigns |
| Pro app | `grace.adeyemi@mail.example` | Business list after sign-in, home earnings and withdraw, jobs with task photos, documents and renewals, training |
| Customer (:3001) | `amara.okafor@mail.example` | Book a deep clean with the task checklist and before photos, view the visit report |
| Admin (:3003) | `ops@relio.example` | Platform totals, suspend a business, dispute D-301 with its booking evidence |

Tomasz Nowak is seeded as inactive (photo ID expired more than 5 days ago), and Tom Okoro as an invited pro.

## How the main features map to the code

| Feature | Where |
|---|---|
| Plans, prices, marketplace fees, feature limits | `packages/shared/src/plans.ts`, enforced by `requireFeature` in `apps/api/src/lib/auth.ts` |
| Service task checklists (all ticked by default, add and remove, up to a maximum) | `packages/shared/src/tasks.ts`, `apps/customer/app/book/[serviceId]/page.tsx`, `POST /customer/bookings` |
| Customer before photos and photo permission | `POST /customer/photos`, `Booking.photoPermission`, `apps/customer/app/book/[serviceId]/page.tsx` |
| Before and after photo for every task | `apps/api/src/lib/visits.ts`, `packages/web-ui/src/BeforeAfter.tsx`, `apps/pro/app/job/[id].tsx` |
| Pro sign-in by email, list of businesses that added them | `apps/api/src/routes/auth.ts`, `GET /pro/businesses`, `apps/pro/app/(auth)/` |
| Pro onboarding and verification by the business | `apps/pro/app/onboarding.tsx`, `POST /business/:id/pros/:proId/documents/:docId/verify` |
| Document expiry, renewal, 5-day grace, inactive pros | `packages/shared/src/documents.ts`, `apps/api/src/jobs/documents.ts`, `apps/pro/app/(tabs)/profile.tsx`, allocation checks in `routes/business.ts` |
| Pro home: earnings, next pay, withdraw | `GET /pro/:proId/home`, `/wallet`, `/withdrawals`, `apps/pro/app/(tabs)/index.tsx`, `apps/pro/app/withdraw.tsx` |
| Training to do (new or refresher) | `GET /pro/:proId/training`, `apps/pro/app/(tabs)/training.tsx` |
| Quality review | `GET /business/:id/quality/queue`, `POST /business/:id/visits/:visitId/review` |
| Payroll reports (weekly, monthly, tax year, CSV) | `GET /business/:id/payroll/report`, `apps/business/app/payroll/page.tsx` |
| Offers and campaigns | `routes/business.ts` (`/offers`, `/campaigns`, `/integrations`) |
| Admin: overview, businesses, disputes, evidence after 5 days | `apps/api/src/routes/admin.ts`, `apps/admin/app/` |
| Access to photos and documents | `apps/api/src/routes/files.ts` checks the customer, business members, allocated pros and admins |

## Deployment

- **Website and prototype** are published to GitHub Pages by `.github/workflows/pages.yml` on every push that touches `prototype/`. `prototype/website.html` becomes the site's `index.html`. If the first run fails at "configure-pages", open the repository's **Settings → Pages**, set **Source** to **GitHub Actions**, and re-run the workflow.
- **CI** (`.github/workflows/ci.yml`) starts PostgreSQL, applies the migrations in `apps/api/prisma/migrations`, seeds the demo data, then runs the typecheck, tests and the build of all four web apps.
- **API** needs a Node host and PostgreSQL (for example Render, Railway or Fly.io). Set `DATABASE_URL`, `JWT_SECRET` and `CORS_ORIGINS` (the address of every web app), run `npx -w @relio/api prisma migrate deploy`, then `npm start -w @relio/api`.
- **Web apps** deploy separately, each to its own address (for example `relio.com`, `app.relio.com`, `business.relio.com`, `admin.relio.com`). On Vercel, create one project per app with the root directory set to `apps/website`, `apps/customer`, `apps/business` or `apps/admin`. Elsewhere, run `npm run build -w @relio/<app>` then `npm start -w @relio/<app>` from the repository root. Set the `NEXT_PUBLIC_*` variables on each.
- **Pro app** builds with Expo's EAS (`npx eas build`) for the App Store and Google Play. Set `expo.extra.apiUrl` in `apps/pro/app.json` to the live API.

## Checks

```bash
npm run typecheck        # shared, web-ui, api and the four web apps
npm test                 # shared rules (tasks, pricing, documents, fees, payroll) and API smoke test
npm run build:web        # production build of website, customer, business and admin
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
