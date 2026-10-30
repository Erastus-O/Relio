import { db } from "./db";

export function audit(e: { actorId?: string | null; actorName: string; businessId?: string | null; action: string; subject: string; detail?: string }) {
  return db.auditLog.create({ data: { ...e, actorId: e.actorId ?? null, businessId: e.businessId ?? null } });
}
