"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatGBP } from "@relio/shared";
import { api } from "@/lib/api";
import { Shell } from "@/components/Shell";

interface Overview { customerSpend: number; platformFees: number; jobsCreated: number; prosEarned: number; activeBusinesses: number }
interface Biz { id: string; name: string; status: string; plan: string; pros: number; bookings: number; inactive: boolean; lastLoginAt: string | null }
interface Disp { id: string; ref: string; business: string; issue: string; amount: number; status: string; decisionDueAt: string; overdue: boolean }


function Admin() {
  const [o, setO] = useState<Overview | null>(null);
  const [biz, setBiz] = useState<Biz[]>([]);
  const [disp, setDisp] = useState<Disp[]>([]);
  const [msg, setMsg] = useState("");
  const load = () => {
    api<Overview>("/admin/overview").then(setO);
    api<Biz[]>("/admin/businesses").then(setBiz);
    api<Disp[]>("/admin/disputes").then(setDisp);
  };
  useEffect(load, []);
  async function setStatus(id: string, status: "active" | "suspended") {
    const note = status === "suspended" ? "Suspended by platform operations pending review." : "Activated after verification.";
    try { await api(`/admin/businesses/${id}/status`, { method: "POST", json: { status, note } }); load(); } catch (e) { setMsg((e as Error).message); }
  }
  if (!o) return <p>Loading…</p>;
  return (
    <>
      <h1>Platform overview</h1>
      <div className="grid2" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
        {([["Customers have spent", formatGBP(o.customerSpend)], ["Platform fees", formatGBP(o.platformFees)], ["Jobs created", String(o.jobsCreated)], ["Pros have earned", formatGBP(o.prosEarned)], ["Active businesses", String(o.activeBusinesses)]] as const).map(([l, v]) => <div key={l} className="card"><span className="small muted">{l}</span><div style={{ font: "700 24px var(--f-display)" }}>{v}</div></div>)}
      </div>
      <h2>Businesses</h2>
      {msg && <p className="err">{msg}</p>}
      <div className="card tablewrap" style={{ padding: 0 }}>
        <table className="t"><thead><tr><th>Business</th><th>Plan</th><th>Pros</th><th>Bookings</th><th>Activity</th><th>Status</th><th /></tr></thead>
          <tbody>{biz.map((b) => <tr key={b.id}><td>{b.name}</td><td>{b.plan}</td><td>{b.pros}</td><td>{b.bookings}</td><td>{b.inactive ? <span className="pill warn">Inactive 30+ days</span> : "Active"}</td><td>{b.status}</td><td>{b.status === "suspended" ? <button className="btn" onClick={() => setStatus(b.id, "active")}>Reinstate</button> : <button className="btn" onClick={() => setStatus(b.id, "suspended")}>Suspend</button>}</td></tr>)}</tbody>
        </table>
      </div>
      <h2>Disputes</h2>
      <div className="card tablewrap" style={{ padding: 0 }}>
        <table className="t"><thead><tr><th>Dispute</th><th>Business</th><th>Issue</th><th className="num">Amount</th><th>Decision due</th><th>Status</th><th /></tr></thead>
          <tbody>{disp.map((d) => <tr key={d.id}><td>{d.ref}</td><td>{d.business}</td><td>{d.issue}</td><td className="num">{formatGBP(d.amount)}</td><td>{new Date(d.decisionDueAt).toLocaleDateString("en-GB")}{d.overdue && <span className="pill bad" style={{ marginLeft: 6 }}>Overdue</span>}</td><td>{d.status.replace("_", " ")}</td><td><Link className="btn" href={`/admin/disputes/${d.id}`}>View</Link></td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

export default function Page() {
  return <Shell links={[["/admin", "Overview"]]} need={(me) => Boolean(me.admin)}>{() => <Admin />}</Shell>;
}
