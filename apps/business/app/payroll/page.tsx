"use client";
import { useState } from "react";
import { formatGBP, type ReportPeriod } from "@relio/shared";
import { api, fetchBlob } from "@relio/web-ui";
import { BizShell } from "@/components/BizShell";

interface Row { proId: string; name: string; hours: number; gross: number; tax: number; ni: number; loan: number; net: number; employerNi: number; unpaid: number }
interface Report { from: string; to: string; rows: Row[]; total: Omit<Row, "proId" | "name" | "unpaid"> }

function Payroll({ bid }: { bid: string }) {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [anchor, setAnchor] = useState(new Date().toISOString().slice(0, 10));
  const [rep, setRep] = useState<Report | null>(null);
  const [err, setErr] = useState("");
  const qs = `period=${period}&anchor=${anchor}`;
  async function gen() {
    setErr("");
    try { setRep(await api<Report>(`/business/${bid}/payroll/report?${qs}`)); } catch (e) { setErr((e as Error).message); }
  }
  async function csv() {
    const blob = await fetchBlob(`/business/${bid}/payroll/report?${qs}&format=csv`);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `payroll-${period}-${anchor}.csv`;
    a.click();
  }
  return (
    <>
      <h1>Payroll reports</h1>
      <section className="card stack">
        <div className="row" role="group" aria-label="Report type">{(["week", "month", "year"] as const).map((p) => <button key={p} className={`btn ${period === p ? "dark" : ""}`} onClick={() => setPeriod(p)}>{p === "week" ? "Weekly" : p === "month" ? "Monthly" : "Yearly (tax year)"}</button>)}</div>
        <label className="f" style={{ maxWidth: 240 }}>Any date in the period<input id="anchor" type="date" value={anchor} onChange={(e) => setAnchor(e.target.value)} /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <div className="row"><button className="btn dark" onClick={gen}>Generate report</button>{rep && <button className="btn" onClick={csv}>Download CSV</button>}</div>
      </section>
      {rep && (
        <section className="card stack">
          <h2 style={{ fontSize: 18 }}>{new Date(rep.from).toLocaleDateString("en-GB")} to {new Date(rep.to).toLocaleDateString("en-GB")}</h2>
          <div className="tablewrap">
            <table className="t">
              <thead><tr><th>Employee</th><th className="num">Hours</th><th className="num">Gross</th><th className="num">Income tax</th><th className="num">Employee NI</th><th className="num">Student loan</th><th className="num">Net pay</th><th className="num">Employer NI</th></tr></thead>
              <tbody>
                {rep.rows.map((r) => <tr key={r.proId}><td>{r.name}{r.unpaid > 0 && <div className="small muted">{formatGBP(r.unpaid)} not paid yet</div>}</td><td className="num">{r.hours.toFixed(2)}</td><td className="num">{formatGBP(r.gross)}</td><td className="num">{formatGBP(r.tax)}</td><td className="num">{formatGBP(r.ni)}</td><td className="num">{formatGBP(r.loan)}</td><td className="num"><b>{formatGBP(r.net)}</b></td><td className="num">{formatGBP(r.employerNi)}</td></tr>)}
                <tr><td><b>Total</b></td><td className="num"><b>{rep.total.hours.toFixed(2)}</b></td><td className="num"><b>{formatGBP(rep.total.gross)}</b></td><td className="num">{formatGBP(rep.total.tax)}</td><td className="num">{formatGBP(rep.total.ni)}</td><td className="num">{formatGBP(rep.total.loan)}</td><td className="num"><b>{formatGBP(rep.total.net)}</b></td><td className="num">{formatGBP(rep.total.employerNi)}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="small muted">Pay periods that only partly overlap this report are split by days. Use your payroll provider’s payslips and P60s for HMRC.</p>
        </section>
      )}
    </>
  );
}

export default function Page() {
  return <BizShell>{(bid) => <Payroll bid={bid} />}</BizShell>;
}
