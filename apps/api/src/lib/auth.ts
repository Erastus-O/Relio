import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { db } from "./db";
import { env } from "./env";
import { HttpError, forbidden } from "./http";
import { sendEmail } from "./notify";
import { hasFeature, type FeatureKey } from "@relio/shared";

export interface AuthUser {
  id: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const CODE_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;
export const normEmail = (e: string) => e.trim().toLowerCase();

/** Emails a 6-digit sign-in code. Always responds the same way so emails can't be enumerated. */
export async function issueLoginCode(emailRaw: string) {
  const email = normEmail(emailRaw);
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  await db.loginCode.create({
    data: { email, codeHash: await bcrypt.hash(code, 10), expiresAt: new Date(Date.now() + CODE_TTL_MIN * 60_000) },
  });
  await sendEmail(email, "Your sign-in code", `Your code is ${code}. It expires in ${CODE_TTL_MIN} minutes.`);
  return env.isProd ? undefined : code; // dev convenience
}

export async function verifyLoginCode(emailRaw: string, code: string): Promise<{ token: string; user: AuthUser }> {
  const email = normEmail(emailRaw);
  const rec = await db.loginCode.findFirst({ where: { email, usedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } });
  if (!rec) throw new HttpError(400, "That code has expired. Ask for a new one.");
  if (rec.attempts >= MAX_ATTEMPTS) throw new HttpError(429, "Too many attempts. Ask for a new code.");
  const ok = await bcrypt.compare(code, rec.codeHash);
  if (!ok) {
    await db.loginCode.update({ where: { id: rec.id }, data: { attempts: { increment: 1 } } });
    throw new HttpError(400, "That code isn't right. Check the latest email we sent.");
  }
  await db.loginCode.update({ where: { id: rec.id }, data: { usedAt: new Date() } });
  const user = await db.user.upsert({ where: { email }, update: {}, create: { email } });
  const token = jwt.sign({ sub: user.id, email }, env.jwtSecret, { expiresIn: "30d" });
  return { token, user: { id: user.id, email } };
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith("Bearer ")) return next(new HttpError(401, "Please sign in."));
  try {
    const p = jwt.verify(hdr.slice(7), env.jwtSecret) as { sub: string; email: string };
    req.user = { id: p.sub, email: p.email };
    next();
  } catch {
    next(new HttpError(401, "Your session has ended. Please sign in again."));
  }
}

/** Ensures the signed-in user is a member of the business in :businessId with one of the roles. */
export function requireBusiness(roles: ("owner" | "manager" | "supervisor" | "office")[] = ["owner", "manager", "supervisor", "office"]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const m = await db.businessMember.findUnique({
        where: { userId_businessId: { userId: req.user!.id, businessId: req.params.businessId } },
        include: { business: true },
      });
      if (!m || !roles.includes(m.role)) throw forbidden();
      if (m.business.status === "suspended") throw forbidden("This business is suspended. Contact platform support.");
      (req as Request & { business: typeof m.business }).business = m.business;
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function requireFeature(feature: FeatureKey) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const b = (req as Request & { business?: { plan: "starter" | "growth" | "team" | "enterprise" } }).business;
    if (!b || !hasFeature(b.plan, feature)) return next(new HttpError(402, "This feature isn't included in your plan. Upgrade in Settings › Plan."));
    next();
  };
}

/** Ensures :proId is a pro record linked to the signed-in user and still active in the app. */
export async function loadOwnPro(req: Request) {
  const pro = await db.pro.findUnique({ where: { id: req.params.proId }, include: { business: true } });
  if (!pro || pro.userId !== req.user!.id) throw forbidden();
  if (pro.appStatus !== "active") throw forbidden("Your access to this business has been removed.");
  return pro;
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const a = await db.adminUser.findUnique({ where: { userId: req.user!.id } });
    if (!a) throw forbidden();
    next();
  } catch (e) {
    next(e);
  }
}
