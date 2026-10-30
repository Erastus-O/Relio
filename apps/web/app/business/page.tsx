"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatGBP } from "@relio/shared";
import { api } from "@/lib/api";
import { BizShell } from "@/components/BizShell";

interface Overview { plan: string; status: string; todayVisits: number; toReview: number; openConcerns: number; prosNeedingAction: number }
interface VisitRow { id: string; startsAt: string; state: string; site: string; service: string; price: number; crew: { name: string }[] }

function Dash({ bid }: { bid: string }) {
  const [o, setO] = useState<Overview | null>(null);
  const [visits, setVisits] = useState<VisitRow[]>([]);
  useEffect(() => {
    api<Overview>(`/business/${bid}/overview`).then(setO);
    api<VisitRow[]>(`/business/${bid}/visits?from=${new Date(Date.now() - 14 * 864e5).toISOString()}`).then(setVisits);
  }, [bid]);
  if (!o) return <p>Loading…</p>;
  const tiles: [string, number, string][] = [["Visits today", o.todayVisits, "/business"], ["Waiting for review", o.toReview, "/business/quality"], ["Open concerns", o.openConcerns, "/business"], ["Pro documents to check", o.prosNeedingAction, "/business/pros"]];
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}><h1>Overview</h1><span className="pill">{o.plan} plan</span></div>
      <div className="grid2" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
        {tiles.map(([l, n, href]) => <Link key={l} href={href} className="card" style={{ textDecoration: "none" }}><span className="small muted">{l}</span><div style={{ font: "700 28px var(--f-display)" }}>{n}</div></Link>)}
      </div>
      <div className="card tablewrap" style={{ padding: 0 }}>
        <table className="t">
          <thead><tr><th>When</th><th>Site</th><th>Service</th><th>Crew</th><th>Status</th><th className="num">Value</th><th /></tr></thead>
          <tbody>{visits.map((v) => (
            <tr key={v.id}><td>{new Date(v.startsAt).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td><td>{v.site}</td><td>{v.service}</td><td>{v.crew.map((c) => c.name).join(", ") || "Nobody yet"}</td><td>{v.state.replace("_", " ")}</td><td className="num">{formatGBP(v.price)}</td><td><Link className="btn" href={`/business/visits/${v.id}`}>View</Link></td></tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}

export default function Page() {
  return <BizShell>{(bid) => <Dash bid={bid} />}</BizShell>;
}
