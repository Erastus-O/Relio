import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db";
import { env } from "../lib/env";
import { HttpError, h, notFound, parse } from "../lib/http";
import { requireAdmin, requireAuth } from "../lib/auth";
import { audit } from "../lib/audit";
import { visitWithEvidence } from "../lib/visits";

export const admin = Router();
admin.use("/admin", requireAuth, requireAdmin);

admin.get("/admin/overview", h(async (_req, res) => {
  const [paid, fees, jobs, payLines, active] = await Promise.all([
    db.visit.aggregate({ _sum: { price: true }, where: { state: { in: ["completed", "partial"] } } }),
    db.booking.aggregate({ _sum: { platformFee: true } }),
    db.visit.count(),
    db.payLine.aggregate({ _sum: { net: true }, where: { period: { status: "paid" } } }),
    db.business.count({ where: { status: "active" } }),
  ]);
  res.json({ customerSpend: paid._sum.price ?? 0, platformFees: fees._sum.platformFee ?? 0, jobsCreated: jobs, prosEarned: payLines._sum.net ?? 0, activeBusinesses: active });
}));

admin.get("/admin/businesses", h(async (req, res) => {
  const inactiveDays = Number(req.query.inactiveDays ?? 30);
  const list = await db.business.findMany({ include: { _count: { select: { pros: true, bookings: true } }, checks: true }, orderBy: { createdAt: "desc" } });
  const cutoff = Date.now() - inactiveDays * 86_400_000;
  res.json(list.map((b) => ({
    id: b.id, name: b.name, status: b.status, plan: b.plan, pros: b._count.pros, bookings: b._count.bookings,
    lastLoginAt: b.lastLoginAt, inactive: !b.lastLoginAt || b.lastLoginAt.getTime() < cutoff,
    checks: b.checks.map((c) => ({ kind: c.kind, status: c.status })),
  })));
}));

admin.post("/admin/businesses/:id/status", h(async (req, res) => {
  const { status, note } = parse(z.object({ status: z.enum(["active", "suspended"]), note: z.string().min(8) }), req.body);
  const b = await db.business.findUnique({ where: { id: req.params.id }, include: { checks: true } });
  if (!b) throw notFound("That business");
  if (status === "active" && b.checks.some((c) => c.status !== "verified")) throw new HttpError(409, "Verify every check before activating this business.");
  await db.business.update({ where: { id: b.id }, data: { status, suspendedNote: status === "suspended" ? note : null } });
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: b.id, action: status === "suspended" ? "Suspended business" : "Activated business", subject: b.name, detail: note });
  res.json({ ok: true });
}));

admin.get("/admin/disputes", h(async (_req, res) => {
  const list = await db.dispute.findMany({ include: { business: { select: { name: true } } }, orderBy: { decisionDueAt: "asc" } });
  res.json(list.map((d) => ({ id: d.id, ref: d.ref, business: d.business.name, issue: d.issue, amount: d.amount, status: d.status, openedAt: d.openedAt, decisionDueAt: d.decisionDueAt, overdue: d.status !== "resolved" && d.decisionDueAt < new Date() })));
}));

/**
 * Booking evidence (tasks, before/after photos, customer photos, photo choice)
 * unlocks for admins only once a dispute has been open longer than the limit.
 * Each first view is written to the audit log.
 */
admin.get("/admin/disputes/:id", h(async (req, res) => {
  const d = await db.dispute.findUnique({ where: { id: req.params.id }, include: { business: { select: { name: true } } } });
  if (!d) throw notFound("That dispute");
  const ageDays = Math.floor((Date.now() - d.openedAt.getTime()) / 86_400_000);
  const unlocked = d.status !== "resolved" && (ageDays >= env.disputeEvidenceDays || d.decisionDueAt < new Date());
  let evidence = null;
  if (unlocked && d.visitId) {
    evidence = await visitWithEvidence(d.visitId);
    if (!d.evidenceViewedAt) {
      await db.dispute.update({ where: { id: d.id }, data: { evidenceViewedAt: new Date() } });
      await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: d.businessId, action: "Admin viewed booking evidence", subject: d.ref, detail: `Open ${ageDays} days` });
    }
  }
  res.json({ ...d, ageDays, evidence, evidenceUnlocksOn: unlocked ? null : new Date(d.openedAt.getTime() + env.disputeEvidenceDays * 86_400_000) });
}));

admin.post("/admin/disputes/:id/decision", h(async (req, res) => {
  const { outcome, amount, note } = parse(z.object({ outcome: z.enum(["full", "partial", "none"]), amount: z.number().int().min(0).optional(), note: z.string().min(10) }), req.body);
  const d = await db.dispute.findUnique({ where: { id: req.params.id } });
  if (!d) throw notFound("That dispute");
  if (d.status === "resolved") throw new HttpError(409, "This dispute is already resolved.");
  if (outcome === "partial" && (!amount || amount >= d.amount)) throw new HttpError(400, "A partial refund must be less than the amount in dispute.");
  const text = outcome === "full" ? `Full refund of £${(d.amount / 100).toFixed(2)}` : outcome === "partial" ? `Partial refund of £${(amount! / 100).toFixed(2)}` : "No refund · business upheld";
  const tl = [...(d.timeline as unknown[]), { at: new Date(), who: "Platform", text: `${text}. ${note}` }];
  await db.dispute.update({ where: { id: d.id }, data: { status: "resolved", outcome: text, timeline: tl as object } });
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: d.businessId, action: "Decided dispute", subject: d.ref, detail: text });
  res.json({ ok: true, outcome: text });
}));
