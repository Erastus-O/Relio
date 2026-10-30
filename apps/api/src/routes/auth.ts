import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db";
import { h, parse } from "../lib/http";
import { issueLoginCode, normEmail, requireAuth, verifyLoginCode } from "../lib/auth";

export const auth = Router();

auth.post("/auth/code", h(async (req, res) => {
  const { email } = parse(z.object({ email: z.string().email() }), req.body);
  const devCode = await issueLoginCode(email);
  res.json({ ok: true, ...(devCode ? { devCode } : {}) });
}));

auth.post("/auth/verify", h(async (req, res) => {
  const { email, code } = parse(z.object({ email: z.string().email(), code: z.string().regex(/^\d{6}$/) }), req.body);
  res.json(await verifyLoginCode(email, code));
}));

/** Everything the signed-in person can open: businesses, pro records, customer account, admin. */
auth.get("/me", requireAuth, h(async (req, res) => {
  const email = normEmail(req.user!.email);
  const [user, pros] = await Promise.all([
    db.user.findUnique({ where: { id: req.user!.id }, include: { memberships: { include: { business: true } }, customer: true, admin: true } }),
    // Pro records are matched by email, so a pro sees every business that has added them.
    db.pro.findMany({ where: { email }, include: { business: { select: { id: true, name: true } } } }),
  ]);
  res.json({
    user: { id: user!.id, email: user!.email, name: user!.name },
    businesses: user!.memberships.map((m) => ({ id: m.business.id, name: m.business.name, role: m.role, plan: m.business.plan, status: m.business.status })),
    proBusinesses: pros.map((p) => ({ proId: p.id, businessId: p.business.id, business: p.business.name, role: p.role, status: p.appStatus })),
    customer: user!.customer ? { id: user!.customer.id } : null,
    admin: user!.admin ? { role: user!.admin.role } : null,
  });
}));
