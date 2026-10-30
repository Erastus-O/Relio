import { Router } from "express";
import { z } from "zod";
import { DEFAULT_PRICE_LIST, SERVICE_CATALOGUES, buildTaskList, catalogueTasks, marketplaceFee, quote, TaskSelectionError, type PriceList } from "@relio/shared";
import { db } from "../lib/db";
import { HttpError, h, notFound, parse } from "../lib/http";
import { requireAuth } from "../lib/auth";
import { saveUpload, upload } from "../lib/storage";
import { audit } from "../lib/audit";
import { visitWithEvidence } from "../lib/visits";

export const customer = Router();

const district = (pc: string) => pc.trim().toUpperCase().split(/\s+/)[0];

// ----- public marketplace -----

customer.get("/marketplace/services", h(async (req, res) => {
  const pc = String(req.query.postcode ?? "");
  const services = await db.service.findMany({
    where: { published: true, business: { status: "active", ...(pc ? { coverage: { has: district(pc) } } : {}) } },
    include: { business: { select: { id: true, name: true, rating: true, slug: true } } },
  });
  res.json(services.map((s) => ({ id: s.id, name: s.name, category: s.category, bookingMode: s.bookingMode, business: s.business, catalogueKey: s.catalogueKey })));
}));

/** What a service includes: tasks by room (all ticked by default), the maximum, and what isn't included. */
customer.get("/services/:id", h(async (req, res) => {
  const s = await db.service.findUnique({ where: { id: req.params.id }, include: { business: { select: { id: true, name: true, priceList: true } } } });
  if (!s || !s.published) throw notFound("That service");
  const cat = s.catalogueKey ? SERVICE_CATALOGUES[s.catalogueKey] : null;
  res.json({
    id: s.id, name: s.name, business: { id: s.business.id, name: s.business.name }, addOns: s.addOns, bookingMode: s.bookingMode,
    tasks: cat ? { maxTasks: cat.maxTasks, notIncluded: cat.notIncluded, items: catalogueTasks(cat.service) } : null,
  });
}));

const quoteInput = z.object({
  service: z.enum(["regular", "deep", "eot"]),
  size: z.enum(["studio", "1", "2", "3", "4", "5"]),
  bathrooms: z.number().int().min(1).max(6),
  condition: z.enum(["well", "average", "extra", "heavy"]),
  frequency: z.enum(["once", "weekly", "fortnightly", "monthly"]),
  addOns: z.array(z.string()).default([]),
  ownSupplies: z.boolean().default(false),
  area: z.enum(["main", "outer", "outside"]).default("main"),
});

customer.post("/services/:id/quote", h(async (req, res) => {
  const s = await db.service.findUnique({ where: { id: req.params.id }, include: { business: true } });
  if (!s) throw notFound("That service");
  const pl = (s.business.priceList as PriceList | null) ?? DEFAULT_PRICE_LIST;
  res.json(quote(pl, parse(quoteInput, req.body)));
}));

// ----- signed-in customer -----

customer.use("/customer", requireAuth);

async function ensureCustomer(userId: string) {
  return db.customer.upsert({ where: { userId }, update: {}, create: { userId } });
}

/** Photos of the current state, uploaded before booking. They become the "before" record. */
customer.post("/customer/photos", upload.array("photos", 6), h(async (req, res) => {
  const c = await ensureCustomer(req.user!.id);
  const rooms = ([] as string[]).concat(req.body.rooms ?? []);
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (!files.length) throw new HttpError(400, "Add at least one photo.");
  const out = [];
  for (const [i, f] of files.entries()) {
    const s = await saveUpload(f, `customers/${c.id}`);
    out.push(await db.photo.create({ data: { kind: "before", source: "customer", room: rooms[i] || "Other", storageKey: s.key, checksum: s.checksum, takenAt: new Date(), uploadedBy: req.user!.id } }));
  }
  res.status(201).json(out.map((p) => ({ id: p.id, room: p.room, url: `/files/${p.storageKey}` })));
}));

const bookingInput = z.object({
  serviceId: z.string(),
  site: z.object({ label: z.string().min(1), address: z.string().min(5), postcode: z.string().min(5), accessNotes: z.string().optional() }),
  quote: quoteInput,
  startsAt: z.coerce.date(),
  tasks: z.object({ removed: z.array(z.string()).default([]), custom: z.array(z.object({ room: z.string(), name: z.string() })).max(10).default([]) }),
  photoPermission: z.enum(["allowed", "none"]),
  beforePhotoIds: z.array(z.string()).max(6).default([]),
  offerCode: z.string().optional(),
  source: z.enum(["marketplace", "direct"]).default("marketplace"),
});

customer.post("/customer/bookings", h(async (req, res) => {
  const b = parse(bookingInput, req.body);
  const c = await ensureCustomer(req.user!.id);
  const s = await db.service.findUnique({ where: { id: b.serviceId }, include: { business: true } });
  if (!s || !s.published || s.business.status !== "active") throw new HttpError(409, "This service is no longer available.");
  if (!s.business.coverage.includes(district(b.site.postcode))) throw new HttpError(409, "This business doesn't cover that postcode.");
  if (b.startsAt.getTime() < Date.now() + 60 * 60_000) throw new HttpError(400, "Choose a time at least an hour from now.");
  const pl = (s.business.priceList as PriceList | null) ?? DEFAULT_PRICE_LIST;
  const q = quote(pl, { ...b.quote, service: s.catalogueKey ?? b.quote.service });
  if (q.status === "review") throw new HttpError(409, `This booking needs a quote first: ${q.reviewReasons.join("; ")}.`);
  let tasks;
  try {
    tasks = buildTaskList({ service: s.catalogueKey ?? b.quote.service, removed: b.tasks.removed, custom: b.tasks.custom }, b.photoPermission === "allowed");
  } catch (e) {
    if (e instanceof TaskSelectionError) throw new HttpError(400, e.message);
    throw e;
  }
  const photos = b.beforePhotoIds.length ? await db.photo.findMany({ where: { id: { in: b.beforePhotoIds }, uploadedBy: req.user!.id, bookingId: null, source: "customer" } }) : [];
  if (photos.length !== b.beforePhotoIds.length) throw new HttpError(400, "One of your photos couldn't be found. Upload it again.");

  const offer = b.offerCode ? await db.offer.findFirst({ where: { businessId: s.businessId, code: b.offerCode.toUpperCase(), status: "active" } }) : null;
  if (b.offerCode && !offer) throw new HttpError(400, "That offer code isn't valid for this business.");
  const firstCharge = q.firstVisitTotal ?? q.total;
  const discount = offer ? (offer.type === "pct" ? Math.round((firstCharge * offer.value) / 100) : Math.min(offer.value, firstCharge)) : 0;
  const bookedBefore = (await db.booking.count({ where: { customerId: c.id, businessId: s.businessId } })) > 0;
  const fee = marketplaceFee(s.business.plan, firstCharge - discount, { fromMarketplace: b.source === "marketplace", customerBookedBefore: bookedBefore });
  const durationMin = 150;

  const booking = await db.$transaction(async (tx) => {
    const site = await tx.site.create({ data: { customerId: c.id, ...b.site } });
    const bk = await tx.booking.create({
      data: {
        businessId: s.businessId, customerId: c.id, serviceId: s.id, siteId: site.id, frequency: b.quote.frequency, photoPermission: b.photoPermission,
        source: b.source, priceSnapshot: { ...q, priceListVersion: pl.version, offer: offer ? { id: offer.id, name: offer.name, discount } : null } as object,
        platformFee: fee, offerId: offer?.id,
      },
    });
    await tx.photo.updateMany({ where: { id: { in: photos.map((p) => p.id) } }, data: { bookingId: bk.id } });
    await tx.visit.create({
      data: {
        bookingId: bk.id, businessId: s.businessId, startsAt: b.startsAt, endsAt: new Date(b.startsAt.getTime() + durationMin * 60_000), price: firstCharge - discount,
        tasks: { create: tasks.map((t, i) => ({ sort: i, room: t.room, name: t.name, photo: t.photo ?? undefined, custom: t.custom })) },
      },
    });
    return bk;
  });
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: s.businessId, action: "Booking confirmed", subject: booking.id, detail: `${tasks.length} tasks · photos ${b.photoPermission}` });
  res.status(201).json({ id: booking.id, tasks: tasks.length, charged: firstCharge - discount, platformFee: fee });
}));

customer.get("/customer/bookings", h(async (req, res) => {
  const c = await ensureCustomer(req.user!.id);
  const visits = await db.visit.findMany({
    where: { booking: { customerId: c.id } },
    include: { booking: { include: { service: true, business: { select: { name: true } } } } },
    orderBy: { startsAt: "asc" },
  });
  const now = Date.now();
  // Upcoming first, then past (most recent first).
  const up = visits.filter((v) => v.startsAt.getTime() >= now);
  const past = visits.filter((v) => v.startsAt.getTime() < now).reverse();
  res.json([...up, ...past].map((v) => ({ id: v.id, startsAt: v.startsAt, state: v.state, service: v.booking.service.name, business: v.booking.business.name, price: v.price })));
}));

customer.get("/customer/visits/:id", h(async (req, res) => {
  const c = await ensureCustomer(req.user!.id);
  const v = await db.visit.findUnique({ where: { id: req.params.id }, include: { booking: true } });
  if (!v || v.booking.customerId !== c.id) throw notFound("That visit");
  res.json(await visitWithEvidence(v.id));
}));

customer.post("/customer/visits/:id/concerns", h(async (req, res) => {
  const { text, taskId } = parse(z.object({ text: z.string().min(10), taskId: z.string().optional() }), req.body);
  const c = await ensureCustomer(req.user!.id);
  const v = await db.visit.findUnique({ where: { id: req.params.id }, include: { booking: true } });
  if (!v || v.booking.customerId !== c.id) throw notFound("That visit");
  const concern = await db.concern.create({ data: { visitId: v.id, taskId, text } });
  await audit({ actorId: req.user!.id, actorName: req.user!.email, businessId: v.businessId, action: "Customer raised a concern", subject: v.id, detail: text });
  res.status(201).json(concern);
}));
