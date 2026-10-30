import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { documentState, isInactive, requiredPhotoKinds } from "@relio/shared";
import { db } from "../lib/db";
import { HttpError, forbidden, h, notFound, parse } from "../lib/http";
import { loadOwnPro, normEmail, requireAuth } from "../lib/auth";
import { saveUpload, upload } from "../lib/storage";
import { audit } from "../lib/audit";
import { visitWithEvidence } from "../lib/visits";

export const pro = Router();
pro.use("/pro", requireAuth);

/** Businesses that have added the signed-in email, shown after email + code sign-in. */
pro.get("/pro/businesses", h(async (req, res) => {
  const list = await db.pro.findMany({ where: { email: normEmail(req.user!.email) }, include: { business: { select: { id: true, name: true } } } });
  const order = { active: 0, invited: 1, removed: 2 } as const;
  res.json(list.sort((a, b) => order[a.appStatus] - order[b.appStatus]).map((p) => ({
    proId: p.id, business: p.business, role: p.role, status: p.appStatus,
    setupDone: Boolean((p.onboarding as { done?: boolean }).done),
  })));
}));

/** Accept an invite. The email has just been verified, so no invite code is needed. */
pro.post("/pro/:proId/accept", h(async (req, res) => {
  const p = await db.pro.findUnique({ where: { id: req.params.proId } });
  if (!p || normEmail(p.email) !== normEmail(req.user!.email)) throw forbidden();
  if (p.appStatus === "removed") throw forbidden("This business has removed your access.");
  const up = await db.pro.update({ where: { id: p.id }, data: { appStatus: "active", userId: req.user!.id, inviteCode: null } });
  await audit({ actorId: req.user!.id, actorName: p.name, businessId: p.businessId, action: "Pro app activated", subject: p.name, detail: "Invite accepted with verified email" });
  res.json({ proId: up.id, status: up.appStatus });
}));

const onboardingStep = z.object({
  step: z.enum(["about", "experience", "rtw", "dbs", "pay", "availability", "contract", "permissions", "done"]),
  data: z.record(z.unknown()),
});

pro.post("/pro/:proId/onboarding", h(async (req, res) => {
  const p = await loadOwnPro(req);
  const { step, data } = parse(onboardingStep, req.body);
  const ob = { ...(p.onboarding as Record<string, unknown>), [step]: data, ...(step === "done" ? { done: true, sentAt: new Date().toISOString() } : {}) };
  await db.pro.update({ where: { id: p.id }, data: { onboarding: ob as object } });
  res.json({ ok: true });
}));

/** Home: earnings so far, next pay, balance, today's next visit, document warnings. */
pro.get("/pro/:proId/home", h(async (req, res) => {
  const p = await loadOwnPro(req);
  const [lines, wallet, docs, next] = await Promise.all([
    db.payLine.findMany({ where: { proId: p.id }, include: { period: true }, orderBy: { period: { from: "desc" } } }),
    db.wallet.findUnique({ where: { proId: p.id } }),
    db.proDocument.findMany({ where: { proId: p.id } }),
    db.visit.findFirst({
      where: { allocations: { some: { proId: p.id, status: "published", NOT: { response: "declined" } } }, startsAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }, state: { in: ["scheduled", "in_progress"] } },
      orderBy: { startsAt: "asc" }, include: { booking: { include: { site: true } } },
    }),
  ]);
  const current = lines.find((l) => l.period.status !== "paid");
  const now = new Date();
  const taxYearStart = new Date(Date.UTC(now.getUTCMonth() > 3 || (now.getUTCMonth() === 3 && now.getUTCDate() >= 6) ? now.getUTCFullYear() : now.getUTCFullYear() - 1, 3, 6));
  const docStates = docs.map((d) => ({ kind: d.kind, ...documentState({ expiresOn: d.expiresOn, renewalPending: d.renewalStatus === "submitted" }) }));
  res.json({
    earnedThisPeriod: current ? { gross: current.gross, hours: current.hours, from: current.period.from, to: current.period.to } : null,
    nextPay: current ? { net: current.net, payOn: current.period.payOn, status: current.period.status } : null,
    paidThisTaxYear: lines.filter((l) => l.period.status === "paid" && l.period.from >= taxYearStart).reduce((a, l) => a + l.net, 0),
    balance: wallet?.balance ?? 0,
    nextVisit: next ? { id: next.id, startsAt: next.startsAt, endsAt: next.endsAt, site: next.booking.site.label } : null,
    inactive: isInactive(docs.map((d) => ({ expiresOn: d.expiresOn, renewalPending: d.renewalStatus === "submitted" }))),
    documentAlerts: docStates.filter((d) => ["expired", "lapsed", "expiring"].includes(d.state)),
  });
}));

pro.get("/pro/:proId/visits", h(async (req, res) => {
  const p = await loadOwnPro(req);
  const from = req.query.from ? new Date(String(req.query.from)) : new Date(new Date().setHours(0, 0, 0, 0));
  const to = new Date(from.getTime() + 7 * 86_400_000);
  const visits = await db.visit.findMany({
    where: { allocations: { some: { proId: p.id, status: "published" } }, startsAt: { gte: from, lt: to } },
    include: { booking: { include: { site: true, service: true } }, allocations: { where: { proId: p.id } } },
    orderBy: { startsAt: "asc" },
  });
  res.json(visits.map((v) => ({ id: v.id, startsAt: v.startsAt, endsAt: v.endsAt, state: v.state, site: v.booking.site.label, service: v.booking.service.name, response: v.allocations[0]?.response ?? null })));
}));

async function ownVisit(proId: string, visitId: string) {
  const v = await db.visit.findUnique({ where: { id: visitId }, include: { allocations: true, booking: true } });
  if (!v || !v.allocations.some((a) => a.proId === proId && a.status === "published")) throw notFound("That job");
  return v;
}

pro.get("/pro/:proId/visits/:visitId", h(async (req, res) => {
  const p = await loadOwnPro(req);
  const v = await ownVisit(p.id, req.params.visitId);
  const full = await visitWithEvidence(v.id);
  // Access details unlock 30 minutes before the visit, for assigned pros only.
  const unlocked = Date.now() >= v.startsAt.getTime() - 30 * 60_000;
  const site = await db.site.findUnique({ where: { id: v.booking.siteId } });
  res.json({ ...full, access: { notes: site?.accessNotes ?? null, secret: unlocked ? site?.accessSecret ?? null : null, unlocksAt: new Date(v.startsAt.getTime() - 30 * 60_000) } });
}));

pro.post("/pro/:proId/visits/:visitId/checkin", h(async (req, res) => {
  const p = await loadOwnPro(req);
  const { method } = parse(z.object({ method: z.enum(["qr", "location", "manual"]) }), req.body);
  const v = await ownVisit(p.id, req.params.visitId);
  if (v.checkinAt) return res.json({ ok: true });
  await db.visit.update({ where: { id: v.id }, data: { checkinAt: new Date(), checkinMethod: method, state: "in_progress" } });
  res.json({ ok: true });
}));

pro.patch("/pro/:proId/visits/:visitId/tasks/:taskId", h(async (req, res) => {
  const p = await loadOwnPro(req);
  const { result, reason } = parse(z.object({ result: z.enum(["done", "not_done", "na"]), reason: z.string().optional() }), req.body);
  if (result === "not_done" && !reason?.trim()) throw new HttpError(400, "Say why the task wasn't done.");
  const v = await ownVisit(p.id, req.params.visitId);
  if (!v.checkinAt) throw new HttpError(409, "Check in before recording tasks.");
  if (["submitted", "completed", "partial"].includes(v.state)) throw new HttpError(409, "This job has already been submitted.");
  const t = await db.visitTask.findFirst({ where: { id: req.params.taskId, visitId: v.id } });
  if (!t) throw notFound("That task");
  res.json(await db.visitTask.update({ where: { id: t.id }, data: { result, reason: reason ?? null } }));
}));

/** Attach a before or after photo to a task. Up to 4 per task. */
pro.post("/pro/:proId/visits/:visitId/tasks/:taskId/photos", upload.single("photo"), h(async (req, res) => {
  const p = await loadOwnPro(req);
  const { kind, takenAt } = parse(z.object({ kind: z.enum(["before", "after"]), takenAt: z.coerce.date().optional() }), req.body);
  const v = await ownVisit(p.id, req.params.visitId);
  if (v.booking.photoPermission === "none") throw new HttpError(409, "The customer asked for no photos at this booking.");
  const t = await db.visitTask.findFirst({ where: { id: req.params.taskId, visitId: v.id }, include: { photos: true } });
  if (!t) throw notFound("That task");
  if (t.photos.length >= 4) throw new HttpError(409, "You can add up to 4 photos to a task.");
  if (!req.file) throw new HttpError(400, "Add a photo.");
  const s = await saveUpload(req.file, `visits/${v.id}`);
  const photo = await db.photo.create({ data: { visitId: v.id, taskId: t.id, kind, source: "pro", room: t.room, storageKey: s.key, checksum: s.checksum, takenAt: takenAt ?? new Date(), uploadedBy: req.user!.id } });
  res.status(201).json({ id: photo.id, url: `/files/${photo.storageKey}`, kind });
}));

pro.post("/pro/:proId/visits/:visitId/submit", h(async (req, res) => {
  const p = await loadOwnPro(req);
  const v = await ownVisit(p.id, req.params.visitId);
  const tasks = await db.visitTask.findMany({ where: { visitId: v.id }, include: { photos: true } });
  const problems: string[] = [];
  for (const t of tasks) {
    if (!t.result) problems.push(`${t.room}: ${t.name} has no result`);
    if (t.result === "done" && v.booking.photoPermission === "allowed")
      for (const k of requiredPhotoKinds(t.photo ?? null)) if (!t.photos.some((ph) => ph.kind === k)) problems.push(`${t.room}: ${t.name} needs a ${k} photo`);
  }
  if (problems.length) return res.status(409).json({ error: "Some tasks need attention before you submit.", problems });
  await db.visit.update({ where: { id: v.id }, data: { state: "submitted", submittedAt: new Date(), checkoutAt: v.checkoutAt ?? new Date() } });
  await audit({ actorId: req.user!.id, actorName: p.name, businessId: v.businessId, action: "Pro submitted job", subject: v.id });
  res.json({ ok: true });
}));

// ----- documents -----

pro.get("/pro/:proId/documents", h(async (req, res) => {
  const p = await loadOwnPro(req);
  const docs = await db.proDocument.findMany({ where: { proId: p.id }, orderBy: { kind: "asc" } });
  res.json(docs.map((d) => ({
    id: d.id, kind: d.kind, type: d.type, uploadedAt: d.createdAt, expiresOn: d.expiresOn,
    ...documentState({ expiresOn: d.expiresOn, renewalPending: d.renewalStatus === "submitted" }),
    renewal: d.renewalStatus ? { status: d.renewalStatus, note: d.renewalNote, sentAt: d.renewalSentAt } : null,
  })));
}));

/** Upload a renewed document. Sending it pauses the 5-day countdown while the business checks it. */
pro.post("/pro/:proId/documents/:docId/renewal", upload.single("file"), h(async (req, res) => {
  const p = await loadOwnPro(req);
  const d = await db.proDocument.findFirst({ where: { id: req.params.docId, proId: p.id } });
  if (!d) throw notFound("That document");
  const body = parse(z.object({ expiresOn: z.coerce.date().optional(), issuedOn: z.coerce.date().optional(), certificate: z.string().regex(/^\d{12}$/).optional() }), req.body);
  if (!req.file) throw new HttpError(400, "Add the new document.");
  let expiresOn = body.expiresOn ?? null;
  if (d.kind === "dbs") {
    if (!body.issuedOn || !body.certificate) throw new HttpError(400, "Add the certificate number and issue date.");
    expiresOn = new Date(body.issuedOn.getTime() + 3 * 365 * 86_400_000);
  } else if (d.kind === "photo_id" && (!expiresOn || expiresOn <= new Date())) throw new HttpError(400, "Enter an expiry date in the future.");
  const s = await saveUpload(req.file, `pros/${p.id}/documents`);
  await db.proDocument.update({ where: { id: d.id }, data: { renewalFileKey: s.key, renewalExpiresOn: expiresOn, renewalStatus: "submitted", renewalNote: null, renewalSentAt: new Date() } });
  await audit({ actorId: req.user!.id, actorName: p.name, businessId: p.businessId, action: "Pro sent document renewal", subject: d.kind });
  res.status(201).json({ ok: true });
}));

// ----- training -----

pro.get("/pro/:proId/training", h(async (req, res) => {
  const p = await loadOwnPro(req);
  const [courses, recs] = await Promise.all([db.course.findMany({ where: { businessId: p.businessId } }), db.trainingRecord.findMany({ where: { proId: p.id } })]);
  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 86_400_000);
  const todo = courses.flatMap((c) => {
    const r = recs.find((x) => x.courseId === c.id);
    const refresher = Boolean(r?.completedAt || r?.isRefresher);
    if (r && !r.completedAt) return [{ course: c.name, mandatory: c.mandatory, type: refresher ? "refresher" : "new", status: r.dueOn && r.dueOn < now ? "overdue" : "assigned", dueOn: r.dueOn }];
    if (r?.expiresOn && r.expiresOn < now) return [{ course: c.name, mandatory: c.mandatory, type: "refresher", status: "expired", dueOn: r.expiresOn }];
    if (r?.expiresOn && r.expiresOn <= soon) return [{ course: c.name, mandatory: c.mandatory, type: "refresher", status: "due_soon", dueOn: r.expiresOn }];
    if (!r && c.mandatory) return [{ course: c.name, mandatory: true, type: "new", status: "required", dueOn: null }];
    return [];
  });
  const rank = { overdue: 0, expired: 1, required: 2, due_soon: 3, assigned: 4 } as Record<string, number>;
  res.json(todo.sort((a, b) => rank[a.status] - rank[b.status]));
}));

// ----- wallet -----

pro.get("/pro/:proId/wallet", h(async (req, res) => {
  const p = await loadOwnPro(req);
  const [wallet, accounts] = await Promise.all([
    db.wallet.upsert({ where: { proId: p.id }, update: {}, create: { proId: p.id }, include: { txns: { orderBy: { createdAt: "desc" }, take: 10 } } }),
    db.payoutAccount.findMany({ where: { proId: p.id } }),
  ]);
  res.json({ balance: wallet.balance, transactions: wallet.txns, accounts: accounts.map(({ providerRef: _r, ...a }) => a) });
}));

pro.post("/pro/:proId/payout-accounts", h(async (req, res) => {
  const p = await loadOwnPro(req);
  const a = parse(z.object({ holder: z.string().min(2), bankName: z.string().default("Bank account"), sortCode: z.string().regex(/^\d{2}-?\d{2}-?\d{2}$/), accountNumber: z.string().regex(/^\d{8}$/), preferred: z.boolean().default(true) }), req.body);
  // In production, send the account to the payment provider (with a confirmation-of-payee check) and keep only its reference.
  const providerRef = "acct_" + crypto.randomUUID();
  if (a.preferred) await db.payoutAccount.updateMany({ where: { proId: p.id }, data: { preferred: false } });
  const acc = await db.payoutAccount.create({ data: { proId: p.id, holder: a.holder, bankName: a.bankName, sortCode: a.sortCode.replace(/(\d{2})-?(\d{2})-?(\d{2})/, "$1-$2-$3"), last4: a.accountNumber.slice(-4), providerRef, preferred: a.preferred } });
  res.status(201).json({ id: acc.id, last4: acc.last4, preferred: acc.preferred });
}));

pro.post("/pro/:proId/withdrawals", h(async (req, res) => {
  const p = await loadOwnPro(req);
  const { amount, accountId } = parse(z.object({ amount: z.number().int().min(100), accountId: z.string() }), req.body);
  const acc = await db.payoutAccount.findFirst({ where: { id: accountId, proId: p.id } });
  if (!acc) throw notFound("That account");
  const txn = await db.$transaction(async (tx) => {
    const w = await tx.wallet.findUnique({ where: { proId: p.id } });
    if (!w || w.balance < amount) throw new HttpError(409, `You can withdraw up to £${((w?.balance ?? 0) / 100).toFixed(2)}.`);
    await tx.wallet.update({ where: { id: w.id }, data: { balance: { decrement: amount } } });
    return tx.walletTxn.create({ data: { walletId: w.id, amount: -amount, kind: "withdrawal", accountId: acc.id, ref: "WD-" + crypto.randomBytes(4).toString("hex").toUpperCase() } });
  });
  await audit({ actorId: req.user!.id, actorName: p.name, businessId: p.businessId, action: "Pro withdrew earnings", subject: txn.ref, detail: `£${(amount / 100).toFixed(2)} to ••••${acc.last4}` });
  res.status(201).json({ ref: txn.ref, status: txn.status });
}));
