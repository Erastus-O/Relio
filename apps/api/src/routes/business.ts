import crypto from "node:crypto";
import { Router, type Request } from "express";
import { z } from "zod";
import { PLANS, documentState, isInactive, reportRange, type PlanKey } from "@relio/shared";
import type { Business } from "@prisma/client";
import { db } from "../lib/db";
import { HttpError, h, notFound, parse } from "../lib/http";
import { normEmail, requireAuth, requireBusiness, requireFeature } from "../lib/auth";
import { audit } from "../lib/audit";
import { sendEmail } from "../lib/notify";
import { visitWithEvidence } from "../lib/visits";

export const business = Router();
business.use(["/businesses", "/business"], requireAuth);

const B = (req: Request) => (req as Request & { business: Business }).business;
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + crypto.randomBytes(2).toString("hex");

// ----- onboarding -----

const serviceInput = z.object({ name: z.string().min(2), catalogueKey: z.enum(["regular", "deep", "eot"]).optional(), pricingModel: z.record(z.unknown()), addOns: z.array(z.object({ name: z.string(), price: z.number().int() })).default([]) });

const newBusiness = z.object({
  name: z.string().min(2),
  basePostcode: z.string().min(5),
  coverage: z.array(z.string().regex(/^[A-Z]{1,2}\d[A-Z\d]?$/i)).min(1),
  about: z.string().optional(),
  services: z.array(serviceInput).default([]),
});

business.post("/businesses", h(async (req, res) => {
  const b = parse(newBusiness, req.body);
  const created = await db.business.create({
    data: {
      name: b.name, slug: slugify(b.name), basePostcode: b.basePostcode.toUpperCase(), coverage: b.coverage.map((c) => c.toUpperCase()), about: b.about,
      members: { create: { userId: req.user!.id, role: "owner" } },
      services: { create: b.services.map((s) => ({ name: s.name, catalogueKey: s.catalogueKey, pricingModel: s.pricingModel as object, addOns: s.addOns })) },
      checks: { create: ["identity", "companies_house", "insurance", "bank"].map((kind) => ({ kind })) },
    },
  });
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: created.id, action: "Business created", subject: created.name });
  res.status(201).json({ id: created.id, status: created.status });
}));

const bz = "/business/:businessId";

business.get(`${bz}/overview`, requireBusiness(), h(async (req, res) => {
  const id = B(req).id;
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const [todayVisits, toReview, openConcerns, prosNeedingAction] = await Promise.all([
    db.visit.count({ where: { businessId: id, startsAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) } } }),
    db.visit.count({ where: { businessId: id, state: "submitted" } }),
    db.concern.count({ where: { visit: { businessId: id }, status: "open" } }),
    db.proDocument.count({ where: { pro: { businessId: id }, OR: [{ status: "submitted" }, { renewalStatus: "submitted" }] } }),
  ]);
  res.json({ plan: PLANS[B(req).plan as PlanKey].name, status: B(req).status, todayVisits, toReview, openConcerns, prosNeedingAction });
}));

// ----- services -----

business.get(`${bz}/services`, requireBusiness(), h(async (req, res) => {
  res.json(await db.service.findMany({ where: { businessId: B(req).id }, orderBy: { createdAt: "asc" } }));
}));

business.post(`${bz}/services`, requireBusiness(["owner", "manager"]), h(async (req, res) => {
  const s = parse(serviceInput, req.body);
  const plan = PLANS[B(req).plan as PlanKey];
  if (plan.servicesLimit !== null && (await db.service.count({ where: { businessId: B(req).id } })) >= plan.servicesLimit)
    throw new HttpError(402, `Your plan includes ${plan.servicesLimit} services. Upgrade to add more.`);
  res.status(201).json(await db.service.create({ data: { businessId: B(req).id, name: s.name, catalogueKey: s.catalogueKey, pricingModel: s.pricingModel as object, addOns: s.addOns } }));
}));

business.patch(`${bz}/services/:serviceId`, requireBusiness(["owner", "manager"]), h(async (req, res) => {
  const patch = parse(z.object({ name: z.string().min(2).optional(), published: z.boolean().optional(), pricingModel: z.record(z.unknown()).optional() }), req.body);
  const s = await db.service.findFirst({ where: { id: req.params.serviceId, businessId: B(req).id } });
  if (!s) throw notFound("That service");
  if (patch.published && B(req).status !== "active") throw new HttpError(409, "Finish verification before publishing services.");
  res.json(await db.service.update({ where: { id: s.id }, data: { ...patch, pricingModel: patch.pricingModel as object | undefined } }));
}));

// ----- visits, allocation, quality -----

business.get(`${bz}/visits`, requireBusiness(), h(async (req, res) => {
  const from = req.query.from ? new Date(String(req.query.from)) : new Date(new Date().setHours(0, 0, 0, 0));
  const to = req.query.to ? new Date(String(req.query.to)) : new Date(from.getTime() + 14 * 86_400_000);
  const visits = await db.visit.findMany({
    where: { businessId: B(req).id, startsAt: { gte: from, lt: to } },
    include: { booking: { include: { site: true, service: true } }, allocations: { include: { pro: { select: { id: true, name: true } } } }, _count: { select: { tasks: true } } },
    orderBy: { startsAt: "asc" },
  });
  res.json(visits.map((v) => ({ id: v.id, startsAt: v.startsAt, endsAt: v.endsAt, state: v.state, site: v.booking.site.label, service: v.booking.service.name, price: v.price, tasks: v._count.tasks, crew: v.allocations.map((a) => ({ ...a.pro, status: a.status, response: a.response })) })));
}));

async function businessVisit(req: Request) {
  const v = await db.visit.findFirst({ where: { id: req.params.visitId, businessId: B(req).id } });
  if (!v) throw notFound("That visit");
  return v;
}

/** Visit with every task's before and after photos. */
business.get(`${bz}/visits/:visitId`, requireBusiness(), h(async (req, res) => {
  const v = await businessVisit(req);
  res.json(await visitWithEvidence(v.id));
}));

business.post(`${bz}/visits/:visitId/allocations`, requireBusiness(["owner", "manager", "supervisor"]), requireFeature("rota"), h(async (req, res) => {
  const { proId } = parse(z.object({ proId: z.string() }), req.body);
  const v = await businessVisit(req);
  const p = await db.pro.findFirst({ where: { id: proId, businessId: B(req).id }, include: { documents: true } });
  if (!p) throw notFound("That pro");
  const blocks: string[] = [];
  if (p.appStatus !== "active") blocks.push("Hasn't activated the Pro app");
  const required = ["photo_id", "right_to_work", "dbs", "bank"] as const;
  for (const k of required) if (!p.documents.some((d) => d.kind === k && d.status === "verified")) blocks.push(`${k.replace(/_/g, " ")} not verified`);
  if (isInactive(p.documents.map((d) => ({ expiresOn: d.expiresOn, renewalPending: d.renewalStatus === "submitted" })))) blocks.push("Inactive: document renewal overdue");
  if (blocks.length) return res.status(409).json({ error: `${p.name} can't be given this job.`, blocks });
  const a = await db.allocation.upsert({ where: { visitId_proId: { visitId: v.id, proId } }, update: { status: "draft" }, create: { visitId: v.id, proId } });
  res.status(201).json(a);
}));

business.post(`${bz}/rota/publish`, requireBusiness(["owner", "manager", "supervisor"]), requireFeature("rota"), h(async (req, res) => {
  const { from, to } = parse(z.object({ from: z.coerce.date(), to: z.coerce.date() }), req.body);
  const r = await db.allocation.updateMany({ where: { status: "draft", visit: { businessId: B(req).id, startsAt: { gte: from, lt: to } } }, data: { status: "published" } });
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: B(req).id, action: "Published rota", subject: `${from.toISOString().slice(0, 10)} to ${to.toISOString().slice(0, 10)}`, detail: `${r.count} shifts` });
  res.json({ published: r.count });
}));

business.get(`${bz}/quality/queue`, requireBusiness(), requireFeature("quality_review"), h(async (req, res) => {
  const vs = await db.visit.findMany({ where: { businessId: B(req).id, state: "submitted" }, orderBy: { submittedAt: "asc" }, select: { id: true } });
  res.json(await Promise.all(vs.map((v) => visitWithEvidence(v.id))));
}));

business.post(`${bz}/visits/:visitId/review`, requireBusiness(["owner", "manager", "supervisor"]), h(async (req, res) => {
  const { outcome, note } = parse(z.object({ outcome: z.enum(["accept", "correct", "fail"]), note: z.string().optional() }), req.body);
  const v = await businessVisit(req);
  if (v.state !== "submitted") throw new HttpError(409, "Only submitted visits can be reviewed.");
  if (outcome !== "accept" && !note?.trim()) throw new HttpError(400, "Add a note for the pro.");
  const full = await visitWithEvidence(v.id);
  const missing = full.rooms.flatMap((r) => (r.tasks as { missingPhotos: string[] }[]).filter((t) => t.missingPhotos.length)).length;
  if (outcome === "accept" && missing && full.photoPermission === "allowed") throw new HttpError(409, `${missing} required photo${missing > 1 ? "s are" : " is"} missing. Request a correction.`);
  const notDone = await db.visitTask.count({ where: { visitId: v.id, result: "not_done" } });
  const state = outcome === "correct" ? "in_progress" : outcome === "fail" ? "failed" : notDone ? "partial" : "completed";
  await db.visit.update({ where: { id: v.id }, data: { state, reviewOutcome: outcome, reviewNote: note ?? null, reviewedAt: new Date(), reviewedBy: req.user!.id, ...(outcome === "correct" ? { submittedAt: null } : {}) } });
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: B(req).id, action: "Reviewed visit", subject: v.id, detail: `${outcome}${note ? ": " + note : ""}` });
  res.json({ state });
}));

// ----- pros -----

business.get(`${bz}/pros`, requireBusiness(), h(async (req, res) => {
  const pros = await db.pro.findMany({ where: { businessId: B(req).id }, include: { documents: true }, orderBy: { name: "asc" } });
  res.json(pros.map((p) => {
    const docs = p.documents.map((d) => ({ kind: d.kind, status: d.status, ...documentState({ expiresOn: d.expiresOn, renewalPending: d.renewalStatus === "submitted" }) }));
    const inactive = docs.some((d) => d.state === "lapsed");
    const expired = docs.find((d) => d.state === "expired");
    const unverified = ["photo_id", "right_to_work", "dbs", "bank"].filter((k) => !p.documents.some((d) => d.kind === k && d.status === "verified"));
    const readiness = p.appStatus !== "active" ? "Invited" : unverified.length ? "Verification pending" : inactive ? "Inactive: document renewal overdue" : expired ? `Renew ${expired.kind.replace(/_/g, " ")} by ${expired.renewBy?.toISOString().slice(0, 10)}` : "Ready";
    return { id: p.id, name: p.name, email: p.email, role: p.role, appStatus: p.appStatus, readiness, documents: docs };
  }));
}));

business.post(`${bz}/pros`, requireBusiness(["owner", "manager"]), h(async (req, res) => {
  const b = parse(z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), role: z.string().default("Cleaner"), hourlyRate: z.number().int().min(0).default(1285) }), req.body);
  const plan = PLANS[B(req).plan as PlanKey];
  const active = await db.pro.count({ where: { businessId: B(req).id, appStatus: { not: "removed" } } });
  if (plan.prosIncluded !== null && active >= plan.prosIncluded && !plan.extraProMonthly) throw new HttpError(402, `Your plan includes ${plan.prosIncluded} pro. Upgrade to add your team.`);
  const email = normEmail(b.email);
  if (await db.pro.findUnique({ where: { businessId_email: { businessId: B(req).id, email } } })) throw new HttpError(409, "Someone on your team already uses that email.");
  const code = `${B(req).name.slice(0, 2).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
  const p = await db.pro.create({ data: { businessId: B(req).id, name: b.name, email, phone: b.phone, role: b.role, hourlyRate: b.hourlyRate, inviteCode: code } });
  await sendEmail(email, `${B(req).name} added you to the Pro app`, `Download the Pro app and sign in with ${email}. ${B(req).name} will appear in your businesses.`);
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: B(req).id, action: "Invited pro", subject: p.name });
  res.status(201).json({ id: p.id, inviteCode: code });
}));

business.post(`${bz}/pros/:proId/remove`, requireBusiness(["owner", "manager"]), h(async (req, res) => {
  const p = await db.pro.findFirst({ where: { id: req.params.proId, businessId: B(req).id } });
  if (!p) throw notFound("That pro");
  await db.$transaction([
    db.pro.update({ where: { id: p.id }, data: { appStatus: "removed", inviteCode: null } }),
    db.allocation.updateMany({ where: { proId: p.id, visit: { startsAt: { gte: new Date() } } }, data: { status: "cancelled" } }),
  ]);
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: B(req).id, action: "Removed pro app access", subject: p.name });
  res.json({ ok: true });
}));

async function businessDoc(req: Request) {
  const d = await db.proDocument.findFirst({ where: { id: req.params.docId, pro: { id: req.params.proId, businessId: B(req).id } }, include: { pro: true } });
  if (!d) throw notFound("That document");
  return d;
}

business.post(`${bz}/pros/:proId/documents/:docId/verify`, requireBusiness(["owner", "manager"]), requireFeature("pro_verification"), h(async (req, res) => {
  const { decision, note } = parse(z.object({ decision: z.enum(["verify", "reject"]), note: z.string().optional() }), req.body);
  const d = await businessDoc(req);
  if (decision === "reject" && (note?.trim().length ?? 0) < 8) throw new HttpError(400, "Tell them what to fix (at least 8 characters).");
  await db.proDocument.update({ where: { id: d.id }, data: { status: decision === "verify" ? "verified" : "rejected", note: note ?? null, verifiedAt: new Date(), verifiedBy: req.user!.id } });
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: B(req).id, action: decision === "verify" ? "Verified pro document" : "Sent pro document back", subject: `${d.pro.name} · ${d.kind}`, detail: note });
  res.json({ ok: true });
}));

business.post(`${bz}/pros/:proId/documents/:docId/renewal`, requireBusiness(["owner", "manager"]), requireFeature("document_expiry"), h(async (req, res) => {
  const { decision, note } = parse(z.object({ decision: z.enum(["approve", "reject"]), note: z.string().optional() }), req.body);
  const d = await businessDoc(req);
  if (d.renewalStatus !== "submitted" || !d.renewalFileKey) throw new HttpError(409, "There's no renewal waiting for a check.");
  if (decision === "reject") {
    if ((note?.trim().length ?? 0) < 8) throw new HttpError(400, "Say what needs fixing (at least 8 characters).");
    await db.proDocument.update({ where: { id: d.id }, data: { renewalStatus: "rejected", renewalNote: note } });
  } else {
    await db.proDocument.update({ where: { id: d.id }, data: { fileKey: d.renewalFileKey, expiresOn: d.renewalExpiresOn, status: "verified", verifiedAt: new Date(), verifiedBy: req.user!.id, renewalFileKey: null, renewalExpiresOn: null, renewalStatus: null, renewalNote: null } });
  }
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: B(req).id, action: decision === "approve" ? "Approved document renewal" : "Sent document renewal back", subject: `${d.pro.name} · ${d.kind}`, detail: note });
  res.json({ ok: true });
}));

// ----- payroll reports -----

business.get(`${bz}/payroll/report`, requireBusiness(["owner", "manager"]), requireFeature("payroll_reports"), h(async (req, res) => {
  const q = parse(z.object({ period: z.enum(["week", "month", "year"]), anchor: z.coerce.date().default(new Date()), proId: z.string().optional() }), req.query);
  const { from, to } = reportRange(q.period, q.anchor);
  const lines = await db.payLine.findMany({
    where: { pro: { businessId: B(req).id, ...(q.proId ? { id: q.proId } : {}) }, period: { from: { lte: to }, to: { gte: from } } },
    include: { period: true, pro: { select: { id: true, name: true } } },
  });
  // Pay periods that only partly overlap the report are split by days.
  const day = 86_400_000;
  const rows = new Map<string, { proId: string; name: string; hours: number; gross: number; tax: number; ni: number; loan: number; net: number; employerNi: number; unpaid: number }>();
  for (const l of lines) {
    const pFrom = l.period.from.getTime(), pTo = l.period.to.getTime();
    const overlap = Math.max(0, Math.min(pTo, to.getTime()) - Math.max(pFrom, from.getTime()) + day) / (pTo - pFrom + day);
    const r = rows.get(l.proId) ?? { proId: l.proId, name: l.pro.name, hours: 0, gross: 0, tax: 0, ni: 0, loan: 0, net: 0, employerNi: 0, unpaid: 0 };
    r.hours += l.hours * overlap;
    for (const k of ["gross", "tax", "ni", "loan", "net", "employerNi"] as const) r[k] += Math.round(l[k] * overlap);
    if (l.period.status !== "paid") r.unpaid += Math.round(l.net * overlap);
    rows.set(l.proId, r);
  }
  const list = [...rows.values()].map((r) => ({ ...r, hours: Math.round(r.hours * 4) / 4 }));
  const total = list.reduce((t, r) => ({ hours: t.hours + r.hours, gross: t.gross + r.gross, tax: t.tax + r.tax, ni: t.ni + r.ni, loan: t.loan + r.loan, net: t.net + r.net, employerNi: t.employerNi + r.employerNi }), { hours: 0, gross: 0, tax: 0, ni: 0, loan: 0, net: 0, employerNi: 0 });
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: B(req).id, action: "Generated payroll report", subject: `${q.period} from ${from.toISOString().slice(0, 10)}` });
  if (req.query.format === "csv") {
    const f = (p: number) => (p / 100).toFixed(2);
    const csv = ["employee,hours,gross_gbp,income_tax_gbp,employee_ni_gbp,student_loan_gbp,net_pay_gbp,employer_ni_gbp"]
      .concat(list.map((r) => [JSON.stringify(r.name), r.hours.toFixed(2), f(r.gross), f(r.tax), f(r.ni), f(r.loan), f(r.net), f(r.employerNi)].join(",")))
      .join("\n");
    res.type("text/csv").attachment(`payroll-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}.csv`).send(csv);
    return;
  }
  res.json({ from, to, rows: list, total });
}));

// ----- offers and campaigns -----

business.get(`${bz}/offers`, requireBusiness(), h(async (req, res) => res.json(await db.offer.findMany({ where: { businessId: B(req).id } }))));

business.post(`${bz}/offers`, requireBusiness(["owner", "manager"]), requireFeature("offers"), h(async (req, res) => {
  const o = parse(z.object({ name: z.string().min(2), code: z.string().regex(/^[A-Z0-9]{4,16}$/i).optional(), type: z.enum(["pct", "amount"]), value: z.number().int().positive(), newCustomersOnly: z.boolean().default(false), startsOn: z.coerce.date().optional(), endsOn: z.coerce.date().optional() }), req.body);
  if (o.type === "pct" && o.value > 50) throw new HttpError(400, "Percentage offers can be up to 50%.");
  const plan = PLANS[B(req).plan as PlanKey];
  if (plan.activeOffersLimit !== null && (await db.offer.count({ where: { businessId: B(req).id, status: "active" } })) >= plan.activeOffersLimit)
    throw new HttpError(402, `Your plan includes ${plan.activeOffersLimit} active offer. Pause one or upgrade.`);
  res.status(201).json(await db.offer.create({ data: { businessId: B(req).id, ...o, code: o.code?.toUpperCase() } }));
}));

const campaignInput = z.object({
  name: z.string().min(3),
  channel: z.enum(["email", "sms", "ads", "reviews"]),
  platform: z.string().default("own"),
  audience: z.enum(["all", "lapsed", "domestic", "commercial", "area", "similar", "rated"]),
  subject: z.string().optional(),
  body: z.string().min(10),
  headline: z.string().max(30).optional(),
  budget: z.number().int().min(500).optional(),
  offerId: z.string().optional(),
  sendAt: z.coerce.date().optional(),
  draft: z.boolean().default(false),
});

business.get(`${bz}/campaigns`, requireBusiness(), h(async (req, res) => res.json(await db.campaign.findMany({ where: { businessId: B(req).id }, orderBy: { createdAt: "desc" } }))));

business.post(`${bz}/campaigns`, requireBusiness(["owner", "manager"]), requireFeature("campaigns"), h(async (req, res) => {
  const c = parse(campaignInput, req.body);
  if (c.channel === "email" && !c.subject) throw new HttpError(400, "Add a subject line.");
  if (c.platform !== "own" && !(await db.integration.findUnique({ where: { businessId_provider: { businessId: B(req).id, provider: c.platform } } })))
    throw new HttpError(409, `Connect ${c.platform} first.`);
  if ((c.channel === "ads" || c.channel === "reviews") && c.platform === "own") throw new HttpError(409, "Connect an ads account or Google Business Profile for this campaign type.");
  const status = c.draft ? "draft" : c.sendAt && c.sendAt > new Date() ? "scheduled" : c.channel === "email" || c.channel === "sms" ? "sent" : "running";
  // Only customers who agreed to marketing are ever included.
  const reached = status === "sent" ? await db.customer.count({ where: { marketingConsent: true, bookings: { some: { businessId: B(req).id } } } }) : 0;
  const created = await db.campaign.create({ data: { businessId: B(req).id, name: c.name, channel: c.channel, platform: c.platform, audience: c.audience, subject: c.subject, body: c.body, headline: c.headline, budget: c.budget, offerId: c.offerId, status, scheduledAt: c.sendAt, sentAt: status === "sent" ? new Date() : null, reached } });
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: B(req).id, action: `Campaign ${status}`, subject: c.name });
  res.status(201).json(created);
}));

business.post(`${bz}/integrations`, requireBusiness(["owner"]), requireFeature("campaign_integrations"), h(async (req, res) => {
  const i = parse(z.object({ provider: z.enum(["mailchimp", "brevo", "klaviyo", "google_ads", "meta_ads", "tiktok_ads", "nextdoor_ads", "google_business_profile"]), account: z.string().min(2), settings: z.record(z.unknown()).default({}) }), req.body);
  // In production this follows the provider's OAuth flow; tokens are stored in a secrets manager, not here.
  res.status(201).json(await db.integration.upsert({ where: { businessId_provider: { businessId: B(req).id, provider: i.provider } }, update: { account: i.account, status: "connected", settings: i.settings as object }, create: { businessId: B(req).id, provider: i.provider, account: i.account, settings: i.settings as object } }));
}));

business.patch(`${bz}/plan`, requireBusiness(["owner"]), h(async (req, res) => {
  const { plan, billing } = parse(z.object({ plan: z.enum(["starter", "growth", "team", "enterprise"]), billing: z.enum(["monthly", "yearly"]).default("monthly") }), req.body);
  if (plan === "enterprise") throw new HttpError(400, "Talk to sales to move to Enterprise.");
  // Billing is handled by the payment provider's subscriptions; this records the choice.
  await db.business.update({ where: { id: B(req).id }, data: { plan, billing } });
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: B(req).id, action: "Changed plan", subject: plan, detail: billing });
  res.json({ plan, billing });
}));
