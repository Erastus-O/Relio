"use client";
import { useEffect, useState } from "react";
import { api } from "@relio/web-ui";
import { BizShell } from "@/components/BizShell";

interface Doc { kind: string; status: string; state: string; renewBy?: string }
interface Pro { id: string; name: string; email: string; role: string; appStatus: string; readiness: string; documents: Doc[] }

const tone = (r: string) => (r === "Ready" ? "good" : r.startsWith("Inactive") ? "bad" : "warn");

function Pros({ bid }: { bid: string }) {
  const [pros, setPros] = useState<Pro[] | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [msg, setMsg] = useState("");
  const load = () => api<Pro[]>(`/business/${bid}/pros`).then(setPros);
  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bid]);
  async function invite() {
    setMsg("");
    try { await api(`/business/${bid}/pros`, { method: "POST", json: form }); setMsg(`Invited ${form.name}. They sign in to the Pro app with ${form.email}.`); setForm({ name: "", email: "" }); load(); } catch (e) { setMsg((e as Error).message); }
  }
  if (!pros) return <p>Loading…</p>;
  return (
    <>
      <h1>Pros and documents</h1>
      <div className="card tablewrap" style={{ padding: 0 }}>
        <table className="t">
          <thead><tr><th>Pro</th><th>App</th><th>Documents</th><th>Readiness</th></tr></thead>
          <tbody>{pros.map((p) => (
            <tr key={p.id}>
              <td><b>{p.name}</b><div className="small muted">{p.role} · {p.email}</div></td>
              <td>{p.appStatus}</td>
              <td className="small">{p.documents.map((d) => <div key={d.kind}>{d.kind.replace(/_/g, " ")}: <span className={`pill ${d.state === "lapsed" || d.state === "expired" ? "bad" : d.state === "expiring" || d.state === "renewal_pending" ? "warn" : "good"}`}>{d.state.replace("_", " ")}</span></div>)}</td>
              <td><span className={`pill ${tone(p.readiness)}`}>{p.readiness}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <section className="card stack">
        <h2 style={{ fontSize: 18 }}>Add a pro</h2>
        <div className="grid2">
          <label className="f">Full name<input id="pro-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="f">Email<input id="pro-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        </div>
        {msg && <p className="small" role="status">{msg}</p>}
        <button className="btn dark" onClick={invite}>Send invite</button>
        <p className="small muted">Pros only see your business in the Pro app once you’ve added their email. They can’t receive jobs until you’ve verified their ID, right to work, DBS and bank details, and they become inactive if a document expires and isn’t renewed within 5 days.</p>
      </section>
    </>
  );
}

export default function Page() {
  return <BizShell>{(bid) => <Pros bid={bid} />}</BizShell>;
}
