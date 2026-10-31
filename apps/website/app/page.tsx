import Link from "next/link";
import { PLANS, formatGBP, type FeatureKey, type PlanKey } from "@relio/shared";
import { URLS } from "@relio/web-ui";
import { PlanCards } from "./PlanCards";

type Cell = boolean | string;
const rows: [string, (string | [string, (p: PlanKey) => Cell])[]][] = [
  ["Bookings and marketplace", [
    ["Marketplace profile and portfolio", () => true],
    ["Online booking page", () => true],
    ["Services listed", (p) => (PLANS[p].servicesLimit === null ? "Unlimited" : String(PLANS[p].servicesLimit))],
    ["Task checklists customers can tailor", () => true],
    ["Customer before photos and photo choice", () => true],
    ["Recurring plans and quotes", (p) => feat(p, "recurring_and_quotes")],
    ["Marketplace booking fee", (p) => (PLANS[p].marketplaceFeeBps === null ? "Custom" : `${PLANS[p].marketplaceFeeBps! / 100}%`)],
  ]],
  ["Team and Pro app", [
    ["Pros included", (p) => (PLANS[p].prosIncluded === null ? "Unlimited" : String(PLANS[p].prosIncluded))],
    ["Rota, cover and swaps", (p) => feat(p, "rota")],
    ["Pro verification", (p) => feat(p, "pro_verification")],
    ["Document expiry tracking", (p) => feat(p, "document_expiry")],
    ["Training and refreshers", (p) => feat(p, "training")],
    ["Pro earnings and withdrawals", (p) => feat(p, "pro_wallet")],
  ]],
  ["Quality and money", [
    ["Before and after photos by task", () => true],
    ["Quality review queue", (p) => feat(p, "quality_review")],
    ["Invoices for contract clients", (p) => feat(p, "invoices")],
    ["Payroll from approved hours", (p) => feat(p, "payroll")],
    ["Payroll reports", (p) => feat(p, "payroll_reports")],
  ]],
  ["Growth and insights", [
    ["Discounts and offer codes", (p) => (PLANS[p].activeOffersLimit === null ? "Unlimited" : `${PLANS[p].activeOffersLimit} active`)],
    ["Email and text campaigns", (p) => (PLANS[p].campaignEmailsPerMonth === null ? "Custom" : PLANS[p].campaignEmailsPerMonth ? `${PLANS[p].campaignEmailsPerMonth!.toLocaleString("en-GB")} emails a month` : false)],
    ["Campaign platform integrations", (p) => feat(p, "campaign_integrations")],
    ["AI business assistant", (p) => (PLANS[p].aiQuestionsPerMonth === null ? "Unlimited" : PLANS[p].aiQuestionsPerMonth ? `${PLANS[p].aiQuestionsPerMonth} questions a month` : false)],
  ]],
];
function feat(p: PlanKey, f: FeatureKey): Cell {
  return PLANS[p].features.includes(f);
}
const keys = Object.keys(PLANS) as PlanKey[];

export default function Home() {
  return (
    <main>
      <nav className="wrap row" style={{ height: 64, justifyContent: "space-between" }}>
        <strong style={{ fontFamily: "var(--f-display)" }}>Relio</strong>
        <div className="row">
          <a href="#pricing" className="muted">Pricing</a>
          <a className="btn" href={`${URLS.customer}/login`}>Log in</a>
          <a className="btn dark" href={`${URLS.customer}/book`}>Book a service</a>
        </div>
      </nav>

      <section className="wrap stack" style={{ padding: "80px 0 56px", textAlign: "center", alignItems: "center" }}>
        <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", maxWidth: "15ch" }}>Find it. Book it. Get it done right.</h1>
        <p className="muted" style={{ maxWidth: "56ch", fontSize: 17 }}>
          Book vetted local cleaners, repairers and tutors with the price shown up front. Businesses run their rota, evidence, payroll and growth in one place.
        </p>
        <div className="row" style={{ justifyContent: "center" }}>
          <a className="btn dark" href={`${URLS.customer}/book`}>Find a service</a>
          <a className="btn" href="#pricing">For businesses</a>
        </div>
      </section>

      <section className="wrap">
        <div className="panel stack" id="pricing">
          <div className="stack" style={{ alignItems: "center", textAlign: "center" }}>
            <span className="small muted" style={{ textTransform: "uppercase", letterSpacing: ".08em" }}>Pricing for businesses</span>
            <h2 style={{ fontSize: "clamp(1.8rem,3.6vw,2.6rem)" }}>Free to start. Pay as your team grows.</h2>
            <p className="muted" style={{ maxWidth: "62ch" }}>
              Customers book for free and pros use the app for free. Businesses pay a plan, plus a small fee only on bookings the marketplace brings them. Your own customers never carry a platform fee.
            </p>
          </div>
          <PlanCards />
          <h2 style={{ textAlign: "center", marginTop: 24 }}>Compare features</h2>
          <div className="card tablewrap" style={{ padding: 0 }}>
            <table className="t">
              <thead>
                <tr>
                  <th>Feature</th>
                  {keys.map((k) => <th key={k} style={{ textAlign: "center" }}>{PLANS[k].name}<div className="small muted">{PLANS[k].monthly === null ? "Custom" : `${formatGBP(PLANS[k].monthly!)}/mo`}</div></th>)}
                </tr>
              </thead>
              {rows.map(([group, items]) => (
                <tbody key={group}>
                  <tr><th colSpan={5} style={{ paddingTop: 22 }}>{group}</th></tr>
                  {items.map((it) => {
                    const [label, fn] = it as [string, (p: PlanKey) => Cell];
                    return (
                      <tr key={label}>
                        <td>{label}</td>
                        {keys.map((k) => {
                          const v = fn(k);
                          return <td key={k} style={{ textAlign: "center" }}>{v === true ? "✓" : v === false ? <span className="muted">–</span> : v}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              ))}
            </table>
          </div>
          <p className="small muted" style={{ textAlign: "center" }}>Prices exclude VAT. Card processing is passed on at cost on every plan.</p>
        </div>
      </section>

      <footer className="wrap row small muted" style={{ padding: "40px 0", justifyContent: "space-between" }}>
        <span>© {new Date().getFullYear()} Relio</span>
        <span className="row"><a href={URLS.customer}>Customers</a><a href={URLS.business}>Businesses</a><a href={URLS.admin}>Admin</a><Link href="/contact">Contact</Link></span>
      </footer>
    </main>
  );
}
