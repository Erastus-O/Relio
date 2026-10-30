/** Days a pro has to renew an expired document before they become inactive. */
export const DOCUMENT_GRACE_DAYS = 5;
/** Pros are reminded this many days before a document expires. */
export const DOCUMENT_REMINDER_DAYS = 30;

export type DocumentState = "valid" | "expiring" | "expired" | "lapsed" | "renewal_pending";

const DAY = 86_400_000;
const toDay = (d: Date | string) => {
  const x = typeof d === "string" ? new Date(d) : d;
  return Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate());
};

export interface DocumentLike {
  expiresOn: Date | string | null;
  renewalPending?: boolean;
}

export function documentState(doc: DocumentLike, today: Date = new Date()): { state: DocumentState; renewBy?: Date; daysLeft?: number } {
  if (doc.renewalPending) return { state: "renewal_pending" };
  if (!doc.expiresOn) return { state: "valid" };
  const left = Math.round((toDay(doc.expiresOn) - toDay(today)) / DAY);
  if (left < 0) {
    const renewBy = new Date(toDay(doc.expiresOn) + DOCUMENT_GRACE_DAYS * DAY);
    return -left > DOCUMENT_GRACE_DAYS ? { state: "lapsed", renewBy } : { state: "expired", renewBy, daysLeft: DOCUMENT_GRACE_DAYS + left };
  }
  if (left <= DOCUMENT_REMINDER_DAYS) return { state: "expiring", daysLeft: left };
  return { state: "valid", daysLeft: left };
}

/** A pro is inactive (no new jobs) when any document has lapsed past the grace period. */
export function isInactive(docs: DocumentLike[], today: Date = new Date()): boolean {
  return docs.some((d) => documentState(d, today).state === "lapsed");
}
