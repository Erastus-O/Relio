import type { Condition, Frequency, ServiceKey } from "./types";
import type { Pence } from "./money";

export type PropertySize = "studio" | "1" | "2" | "3" | "4" | "5";

export interface PriceList {
  version: number;
  vatRegistered: boolean;
  prices: Record<ServiceKey, Record<PropertySize, Pence>>;
  bathroomsIncluded: Record<PropertySize, number>;
  extraBathroom: Pence;
  conditionUpliftPct: number; // for "extra"
  frequencyDiscountPct: Record<Frequency, number>;
  ownSuppliesDiscountPct: number;
  outerAreaTravel: Pence;
  minimumCharge: Pence;
  addOns: Record<string, { name: string; price: Pence; needsReview?: boolean }>;
}

export const DEFAULT_PRICE_LIST: PriceList = {
  version: 1,
  vatRegistered: false,
  prices: {
    regular: { studio: 6000, "1": 7500, "2": 10000, "3": 13500, "4": 16500, "5": 19500 },
    deep: { studio: 14500, "1": 17500, "2": 22500, "3": 29000, "4": 36000, "5": 48000 },
    eot: { studio: 11000, "1": 14000, "2": 18500, "3": 26000, "4": 32000, "5": 38000 },
  },
  bathroomsIncluded: { studio: 1, "1": 1, "2": 1, "3": 1, "4": 2, "5": 2 },
  extraBathroom: 1200,
  conditionUpliftPct: 20,
  frequencyDiscountPct: { once: 0, monthly: 5, fortnightly: 10, weekly: 15 },
  ownSuppliesDiscountPct: 5,
  outerAreaTravel: 1000,
  minimumCharge: 5000,
  addOns: {
    oven: { name: "Inside oven (single)", price: 2500 },
    fridge: { name: "Inside fridge", price: 1500 },
    windows: { name: "Interior windows", price: 2000 },
    carpet: { name: "Carpet steam clean (1 room)", price: 7000, needsReview: true },
    ironing: { name: "Ironing (1 hour)", price: 2200 },
  },
};

export interface QuoteInput {
  service: ServiceKey;
  size: PropertySize;
  bathrooms: number;
  condition: Condition;
  frequency: Frequency;
  addOns: string[];
  ownSupplies: boolean;
  area: "main" | "outer" | "outside";
}

export interface QuoteLine { label: string; amount: Pence }
export interface Quote {
  status: "fixed" | "review";
  reviewReasons: string[];
  lines: QuoteLine[];
  total: Pence;
  /** Recurring plans: the first visit is charged at the one-off price. */
  firstVisitTotal: Pence | null;
  vat: Pence;
}

export function quote(pl: PriceList, q: QuoteInput): Quote {
  const lines: QuoteLine[] = [];
  const reviewReasons: string[] = [];
  const freq: Frequency = q.service === "regular" ? q.frequency : "once";
  const base = pl.prices[q.service][q.size];
  lines.push({ label: `Clean, ${q.size === "studio" ? "studio" : `${q.size}-bed`}`, amount: base });
  const extraBaths = Math.max(0, q.bathrooms - pl.bathroomsIncluded[q.size]);
  if (extraBaths) lines.push({ label: `Extra bathroom × ${extraBaths}`, amount: extraBaths * pl.extraBathroom });
  let clean = lines.reduce((a, l) => a + l.amount, 0);
  if (q.condition === "extra") {
    const up = Math.round((clean * pl.conditionUpliftPct) / 100);
    lines.push({ label: `Needs extra attention (+${pl.conditionUpliftPct}%)`, amount: up });
    clean += up;
  }
  if (q.condition === "heavy") reviewReasons.push("Heavy or specialist cleans need a custom quote");
  if (q.area === "outside") reviewReasons.push("The address is outside the usual service area");
  for (const k of q.addOns) {
    const a = pl.addOns[k];
    if (!a) continue;
    lines.push({ label: a.name, amount: a.price });
    if (a.needsReview) reviewReasons.push(`${a.name} needs a quick review`);
  }
  if (q.area === "outer") lines.push({ label: "Travel (outer area)", amount: pl.outerAreaTravel });
  if (q.ownSupplies && pl.ownSuppliesDiscountPct) {
    lines.push({ label: `You provide products (−${pl.ownSuppliesDiscountPct}%)`, amount: -Math.round((clean * pl.ownSuppliesDiscountPct) / 100) });
  }
  const oneOff = Math.max(pl.minimumCharge, lines.reduce((a, l) => a + l.amount, 0));
  const pct = pl.frequencyDiscountPct[freq];
  if (pct) lines.push({ label: `${freq[0].toUpperCase()}${freq.slice(1)} discount (${pct}% of the clean)`, amount: -Math.round((clean * pct) / 100) });
  let total = lines.reduce((a, l) => a + l.amount, 0);
  if (total < pl.minimumCharge) {
    lines.push({ label: "Minimum charge adjustment", amount: pl.minimumCharge - total });
    total = pl.minimumCharge;
  }
  const vat = pl.vatRegistered ? Math.round(total * 0.2) : 0;
  return {
    status: reviewReasons.length ? "review" : "fixed",
    reviewReasons,
    lines,
    total: total + vat,
    firstVisitTotal: pct ? oneOff + (pl.vatRegistered ? Math.round(oneOff * 0.2) : 0) : null,
    vat,
  };
}
