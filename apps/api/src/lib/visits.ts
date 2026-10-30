import type { Photo, VisitTask } from "@prisma/client";
import { requiredPhotoKinds } from "@relio/shared";
import { db } from "./db";

const photoOut = (p: Photo) => ({ id: p.id, kind: p.kind, source: p.source, room: p.room, url: `/files/${p.storageKey}`, takenAt: p.takenAt, checksum: p.checksum });

/**
 * A visit with every task paired as before/after. When a task has no before
 * photo of its own, the customer's booking photo of that room is used.
 */
export async function visitWithEvidence(visitId: string) {
  const v = await db.visit.findUniqueOrThrow({
    where: { id: visitId },
    include: {
      tasks: { orderBy: { sort: "asc" }, include: { photos: true } },
      booking: { include: { customerPhotos: true, service: true, site: true } },
      allocations: { where: { status: "published" }, include: { pro: { select: { id: true, name: true } } } },
    },
  });
  const custByRoom = new Map<string, Photo>();
  for (const p of v.booking.customerPhotos) if (p.room && !custByRoom.has(p.room)) custByRoom.set(p.room, p);
  const rooms: Record<string, unknown[]> = {};
  for (const t of v.tasks as (VisitTask & { photos: Photo[] })[]) {
    const before = t.photos.filter((p) => p.kind === "before").map(photoOut);
    const after = t.photos.filter((p) => p.kind === "after").map(photoOut);
    const fallback = !before.length && custByRoom.get(t.room);
    const required = requiredPhotoKinds(t.photo ?? null);
    (rooms[t.room] ??= []).push({
      id: t.id, name: t.name, result: t.result, reason: t.reason, custom: t.custom,
      requiredPhotos: required,
      missingPhotos: required.filter((k) => !(k === "before" ? before.length || fallback : after.length)),
      before: before.length ? before : fallback ? [{ ...photoOut(fallback), fromCustomer: true }] : [],
      after,
    });
  }
  return {
    id: v.id, state: v.state, startsAt: v.startsAt, endsAt: v.endsAt, price: v.price,
    service: v.booking.service.name, site: { label: v.booking.site.label, address: v.booking.site.address },
    photoPermission: v.booking.photoPermission,
    checkinAt: v.checkinAt, checkinMethod: v.checkinMethod, checkoutAt: v.checkoutAt, submittedAt: v.submittedAt,
    review: v.reviewedAt ? { outcome: v.reviewOutcome, note: v.reviewNote, at: v.reviewedAt } : null,
    crew: v.allocations.map((a) => a.pro),
    customerPhotos: v.booking.customerPhotos.map(photoOut),
    rooms: Object.entries(rooms).map(([room, tasks]) => ({ room, tasks })),
  };
}
