"use client";
import { useState } from "react";
import Link from "next/link";
import { PLANS, formatGBP, type PlanKey } from "@relio/shared";
import { URLS } from "@relio/web-ui";

const blurb: Record<PlanKey, { who: string; highlights: string[] }> = {
  starter: { who: "For a sole trader getting their first online bookings.", highlights: ["Marketplace profile and booking page", "Task checklists customers can tailor", "Before and after photos on every job"] },
  growth: { who: "For a small team that wants steady, repeat work.", highlights: ["Rota, cover requests and swaps", "Pro verification and document expiry alerts", "Offers, email and text campaigns"] },
  team: { who: "For an established business running payroll and training.", highlights: ["Payroll from approved hours and reports", "Training records and refreshers", "Pro earnings and withdrawals"] },
  enterprise: { who: "For multi-site operators and franchises.", highlights: ["Several locations under one account", "Custom roles and single sign-on", "Dedicated account manager"] },
};

export function PlanCards() {
  const [yearly, setYearly] = useState(false);
  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "center" }} role="group" aria-label="Billing period">
        <button className={`btn ${!yearly ? "dark" : ""}`} aria-pressed={!yearly} onClick={() => setYearly(false)}>Monthly</button>
        <button className={`btn ${yearly ? "dark" : ""}`} aria-pressed={yearly} onClick={() => setYearly(true)}>Yearly · 2 months free</button>
      </div>
      <div className="grid2" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))" }}>
        {(Object.keys(PLANS) as PlanKey[]).map((k) => {
          const p = PLANS[k];
          const price = p.monthly === null ? "Custom" : formatGBP(yearly && p.yearly !== null ? Math.round(p.yearly / 12) : p.monthly).replace(".00", "");
          return (
            <article key={k} className="card stack" style={k === "team" ? { borderColor: "var(--ink)", boxShadow: "0 0 0 1px var(--ink)" } : undefined}>
              <div>
                <h3>{p.name}</h3>
                <p className="small muted">{blurb[k].who}</p>
              </div>
              <div>
                <strong style={{ font: "700 2.2rem/1 var(--f-display)" }}>{price}</strong>
                <div className="small muted">{p.monthly === null ? "volume pricing" : p.monthly === 0 ? "free forever" : "per month"}</div>
              </div>
              <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
                <li>{p.prosIncluded === null ? "Unlimited" : p.prosIncluded} pro{p.prosIncluded === 1 ? "" : "s"} included{p.extraProMonthly ? `, then ${formatGBP(p.extraProMonthly)} each` : ""}</li>
                <li>{p.marketplaceFeeBps === null ? "Custom" : `${p.marketplaceFeeBps / 100}%`} on {p.feeOnRepeatBookings ? "every marketplace booking" : "a new customer’s first marketplace booking"}</li>
                <li>0% on your own customers</li>
              </ul>
              <Link className={`btn ${k === "team" ? "dark" : ""}`} href={k === "enterprise" ? "/contact" : `${URLS.business}/signup`}>{k === "enterprise" ? "Talk to sales" : k === "starter" ? "Get started" : "Start 30-day trial"}</Link>
              <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{blurb[k].highlights.map((h) => <li key={h}>{h}</li>)}</ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
