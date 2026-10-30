/**
 * Daily job: remind pros 30 days before a document expires, warn when it has
 * expired, and tell the business when a pro becomes inactive (5 days after
 * expiry without a renewal). Run it once a day with cron or a scheduler.
 */
import { DOCUMENT_GRACE_DAYS, documentState } from "@relio/shared";
import { db } from "../lib/db";
import { sendEmail } from "../lib/notify";
import { audit } from "../lib/audit";

export async function runDocumentCheck(today = new Date()) {
  const docs = await db.proDocument.findMany({ where: { expiresOn: { not: null }, pro: { appStatus: "active" } }, include: { pro: { include: { business: { include: { members: { where: { role: "owner" }, include: { user: true } } } } } } } });
  let reminders = 0, inactive = 0;
  for (const d of docs) {
    const s = documentState({ expiresOn: d.expiresOn, renewalPending: d.renewalStatus === "submitted" }, today);
    const label = d.kind.replace(/_/g, " ");
    if (s.state === "expiring" && (s.daysLeft === 30 || s.daysLeft === 7)) {
      await sendEmail(d.pro.email, `Your ${label} expires in ${s.daysLeft} days`, "Renew it in the Pro app under Profile › My documents.");
      reminders++;
    }
    if (s.state === "expired" && s.daysLeft === DOCUMENT_GRACE_DAYS - 1) {
      await sendEmail(d.pro.email, `Your ${label} has expired`, `Renew it by ${s.renewBy?.toDateString()} or you won't get new jobs.`);
      reminders++;
    }
    if (s.state === "lapsed" && s.renewBy && Math.round((today.getTime() - s.renewBy.getTime()) / 86_400_000) === 1) {
      for (const m of d.pro.business.members) await sendEmail(m.user.email, `${d.pro.name} is now inactive`, `Their ${label} expired more than ${DOCUMENT_GRACE_DAYS} days ago. They can't be given new jobs until they renew it.`);
      await audit({ actorName: "System", businessId: d.pro.businessId, action: "Pro became inactive", subject: d.pro.name, detail: `${label} renewal overdue` });
      inactive++;
    }
  }
  return { reminders, inactive };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDocumentCheck().then((r) => { console.log(r); return db.$disconnect(); });
}
