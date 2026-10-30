import { Router } from "express";
import { db } from "../lib/db";
import { forbidden, h, notFound } from "../lib/http";
import { requireAuth } from "../lib/auth";
import { filePath } from "../lib/storage";

export const files = Router();

/**
 * Serves an uploaded file to people allowed to see it: the customer who booked,
 * members of the business, pros allocated to the visit, and admins.
 */
files.get("/files/*", requireAuth, h(async (req, res) => {
  const key = (req.params as Record<string, string>)[0];
  const uid = req.user!.id;
  const isAdmin = !!(await db.adminUser.findUnique({ where: { userId: uid } }));
  const photo = await db.photo.findFirst({ where: { storageKey: key }, include: { visit: { include: { allocations: { include: { pro: true } } } }, booking: { include: { customer: true } } } });
  if (photo) {
    const businessId = photo.visit?.businessId ?? photo.booking?.businessId;
    const ok = isAdmin || photo.uploadedBy === uid || photo.booking?.customer.userId === uid ||
      (businessId && (await db.businessMember.findUnique({ where: { userId_businessId: { userId: uid, businessId } } }))) ||
      photo.visit?.allocations.some((a) => a.pro.userId === uid && a.status === "published");
    if (!ok) throw forbidden();
    return res.sendFile(filePath(key));
  }
  const doc = await db.proDocument.findFirst({ where: { OR: [{ fileKey: key }, { renewalFileKey: key }] }, include: { pro: true } });
  if (doc) {
    const ok = isAdmin || doc.pro.userId === uid || (await db.businessMember.findUnique({ where: { userId_businessId: { userId: uid, businessId: doc.pro.businessId } } }));
    if (!ok) throw forbidden();
    return res.sendFile(filePath(key));
  }
  throw notFound("That file");
}));
