/**
 * Demo data matching the prototype: Fenland Fresh Cleaning with its team,
 * Amara Okafor as a customer, a completed deep clean with before/after
 * photos, and an open dispute. Run with `npm run db:seed`.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_PRICE_LIST, buildTaskList, estimateDeductions } from "@relio/shared";

const db = new PrismaClient();
const day = 86_400_000;
const today = new Date(new Date().setUTCHours(0, 0, 0, 0));
const d = (offset: number) => new Date(today.getTime() + offset * day);

// 1×1 PNG used as a stand-in photo in development.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", "base64");
async function stub(key: string) {
  const full = path.join(process.env.UPLOAD_DIR ?? "./uploads", key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, PNG);
  return key;
}

async function main() {
  await db.$transaction([
    db.auditLog.deleteMany(), db.photo.deleteMany(), db.concern.deleteMany(), db.dispute.deleteMany(), db.visitTask.deleteMany(), db.allocation.deleteMany(),
    db.visit.deleteMany(), db.booking.deleteMany(), db.site.deleteMany(), db.walletTxn.deleteMany(), db.wallet.deleteMany(), db.payoutAccount.deleteMany(),
    db.payLine.deleteMany(), db.payPeriod.deleteMany(), db.trainingRecord.deleteMany(), db.course.deleteMany(), db.proDocument.deleteMany(), db.pro.deleteMany(),
    db.campaign.deleteMany(), db.offer.deleteMany(), db.integration.deleteMany(), db.service.deleteMany(), db.businessCheck.deleteMany(), db.portfolioPhoto.deleteMany(),
    db.businessMember.deleteMany(), db.business.deleteMany(), db.customer.deleteMany(), db.adminUser.deleteMany(), db.loginCode.deleteMany(), db.user.deleteMany(),
  ]);

  const owner = await db.user.create({ data: { email: "dami.cole@fenlandfresh.example", name: "Dami Cole" } });
  const adminUser = await db.user.create({ data: { email: "ops@relio.example", name: "Platform Ops", admin: { create: { role: "super" } } } });
  const amaraUser = await db.user.create({ data: { email: "amara.okafor@mail.example", name: "Amara Okafor" } });

  const ff = await db.business.create({
    data: {
      name: "Fenland Fresh Cleaning", slug: "fenland-fresh", status: "active", plan: "team", basePostcode: "PE6 0JH", rating: 4.6,
      coverage: ["PE1", "PE2", "PE3", "PE4", "PE6", "PE7", "PE11", "PE12"], lastLoginAt: new Date(), priceList: DEFAULT_PRICE_LIST as object,
      members: { create: { userId: owner.id, role: "owner" } },
      checks: { create: ["identity", "companies_house", "insurance", "bank"].map((kind) => ({ kind, status: "verified" as const, checkedAt: d(-200), checkedBy: adminUser.id })) },
    },
  });
  const [regular, deep] = await Promise.all([
    db.service.create({ data: { businessId: ff.id, name: "Regular home clean", catalogueKey: "regular", pricingModel: { model: "fixed_size" }, published: true } }),
    db.service.create({ data: { businessId: ff.id, name: "Deep clean", catalogueKey: "deep", pricingModel: { model: "fixed_size" }, published: true } }),
    db.service.create({ data: { businessId: ff.id, name: "End of tenancy clean", catalogueKey: "eot", pricingModel: { model: "fixed_size" }, published: true } }),
  ]);
  void regular;

  // Pros. Tomasz's photo ID expired more than 5 days ago, so he is inactive; Grace is inside the grace period.
  const grace = await db.pro.create({ data: { businessId: ff.id, name: "Grace Adeyemi", email: "grace.adeyemi@mail.example", appStatus: "active", startDate: d(-600), skills: ["domestic", "office", "deep"] } });
  const tomasz = await db.pro.create({ data: { businessId: ff.id, name: "Tomasz Nowak", email: "tomasz.nowak@mail.example", role: "Senior cleaner", hourlyRate: 1340, appStatus: "active", startDate: d(-700), skills: ["office", "deep"] } });
  await db.pro.create({ data: { businessId: ff.id, name: "Tom Okoro", email: "tom.okoro@mail.example", appStatus: "invited", inviteCode: "FF-7KQ2" } });
  const docs = async (proId: string, idExp: Date, rtwExp: Date | null) => {
    for (const [kind, type, expiresOn] of [["photo_id", "Passport", idExp], ["right_to_work", rtwExp ? "GOV.UK share code" : "British passport", rtwExp], ["dbs", "DBS basic check", d(900)], ["bank", "Bank details", null]] as const)
      await db.proDocument.create({ data: { proId, kind, type, fileKey: await stub(`pros/${proId}/${kind}.png`), expiresOn, status: "verified", verifiedAt: d(-300) } });
  };
  await docs(grace.id, d(1600), d(-2));
  await docs(tomasz.id, d(-8), null);

  const course = await db.course.create({ data: { businessId: ff.id, name: "COSHH and chemical safety", mandatory: true, refreshMonths: 12 } });
  await db.trainingRecord.create({ data: { proId: grace.id, courseId: course.id, completedAt: d(-345), expiresOn: d(20), isRefresher: false } });

  // Pay: one paid period and the current one.
  const paid = await db.payPeriod.create({ data: { from: d(-30), to: d(-16), payOn: d(-8), status: "paid" } });
  const current = await db.payPeriod.create({ data: { from: d(-15), to: d(0), payOn: d(8), status: "draft" } });
  for (const [period, gross, hours] of [[paid, 17755, 13.75], [current, 6425, 5]] as const) {
    const x = estimateDeductions(gross);
    await db.payLine.create({ data: { periodId: period.id, proId: grace.id, hours, gross, tax: x.tax, ni: x.ni, loan: x.loan, net: x.net, employerNi: x.employerNi } });
  }
  await db.wallet.create({ data: { proId: grace.id, balance: 15420, txns: { create: { amount: 15420, kind: "pay", status: "sent", ref: "PAY-SEED-1" } } } });
  await db.payoutAccount.create({ data: { proId: grace.id, holder: "Grace Oluwaseun Adeyemi", bankName: "Monzo", sortCode: "04-00-04", last4: "8812", providerRef: "acct_seed", preferred: true } });

  // Customer with a completed deep clean.
  const amara = await db.customer.create({ data: { userId: amaraUser.id, marketingConsent: true } });
  const site = await db.site.create({ data: { customerId: amara.id, label: "Okafor home", address: "14 Willow Lane, Crowland", postcode: "PE6 0JH", accessNotes: "Key safe by the back door", accessSecret: "4821" } });
  const tasks = buildTaskList({ service: "deep", removed: [], custom: [{ room: "Kitchen", name: "Clean conservatory floor" }] }, true);
  const booking = await db.booking.create({ data: { businessId: ff.id, customerId: amara.id, serviceId: deep.id, siteId: site.id, photoPermission: "allowed", priceSnapshot: { total: 29000 }, platformFee: 725 } });
  const visit = await db.visit.create({
    data: {
      bookingId: booking.id, businessId: ff.id, startsAt: new Date(d(-7).getTime() + 13 * 3600_000), endsAt: new Date(d(-7).getTime() + 16.5 * 3600_000), price: 29000,
      state: "completed", checkinAt: new Date(d(-7).getTime() + 13.1 * 3600_000), checkinMethod: "qr", checkoutAt: new Date(d(-7).getTime() + 16.4 * 3600_000), submittedAt: new Date(d(-7).getTime() + 16.4 * 3600_000), reviewOutcome: "accept", reviewedAt: d(-6),
      tasks: { create: tasks.map((t, i) => ({ sort: i, room: t.room, name: t.name, photo: t.photo ?? undefined, custom: t.custom, result: "done" as const })) },
      allocations: { create: { proId: grace.id, status: "published", response: "accepted" } },
    },
    include: { tasks: true },
  });
  await db.photo.create({ data: { bookingId: booking.id, kind: "before", source: "customer", room: "Kitchen", storageKey: await stub(`customers/${amara.id}/kitchen.png`), checksum: "sha256:seed", takenAt: d(-9), uploadedBy: amaraUser.id } });
  for (const t of visit.tasks) for (const kind of ["before", "after"] as const)
    await db.photo.create({ data: { visitId: visit.id, taskId: t.id, kind, source: "pro", room: t.room, storageKey: await stub(`visits/${visit.id}/${t.id}-${kind}.png`), checksum: "sha256:seed", takenAt: visit.checkinAt!, uploadedBy: grace.id } });

  await db.dispute.create({
    data: {
      ref: "D-301", businessId: ff.id, customerId: amara.id, visitId: visit.id, issue: "Quality: kitchen not cleaned to standard", amount: 6750, status: "open", openedAt: d(-6), decisionDueAt: d(-1),
      timeline: [{ at: d(-6), who: "Customer", text: "Kitchen worktops and hob left greasy." }, { at: d(-5), who: "Business", text: "Offered a free re-clean." }, { at: d(-3), who: "Customer", text: "Declined the re-clean and asked for a refund." }],
    },
  });
  await db.offer.create({ data: { businessId: ff.id, name: "Welcome offer", code: "WELCOME10", type: "pct", value: 10, newCustomersOnly: true } });

  console.log("Seeded. Sign in with any of these emails; the API prints the code in the terminal:");
  console.log("  business owner  dami.cole@fenlandfresh.example");
  console.log("  pro             grace.adeyemi@mail.example (Tomasz is inactive, Tom is invited)");
  console.log("  customer        amara.okafor@mail.example");
  console.log("  admin           ops@relio.example");
}

main().finally(() => db.$disconnect());
