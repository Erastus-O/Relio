"use client";
import { useEffect, useState } from "react";
import { api } from "@relio/web-ui";
import { BizShell } from "@/components/BizShell";

interface Campaign { id: string; name: string; channel: string; platform: string; status: string; reached: number; clicks: number; bookings: number }

const blank = { name: "", channel: "email", audience: "all", subject: "", body: "", sendAt: "" };

function Campaigns({ bid }: { bid: string }) {
  const [list, setList] = useState<Campaign[]>([]);
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState("");
  const load = () => api<Campaign[]>(`/business/${bid}/campaigns`).then(setList);
  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bid]);
  async function save(draft: boolean) {
    setMsg("");
    try {
      await api(`/business/${bid}/campaigns`, { method: "POST", json: { ...f, subject: f.subject || undefined, sendAt: f.sendAt || undefined, draft } });
      setMsg(draft ? "Draft saved." : f.sendAt ? "Scheduled." : "Sent.");
      setF(blank); load();
    } catch (e) { setMsg((e as Error).message); }
  }
  return (
    <>
      <h1>Campaigns</h1>
      <section className="card stack">
        <h2 style={{ fontSize: 18 }}>New campaign</h2>
        <div className="grid2">
          <label className="f">Campaign name<input id="c-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <label className="f">Type<select id="c-channel" value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })}><option value="email">Email</option><option value="sms">Text message</option><option value="ads">Online ads</option><option value="reviews">Google reviews</option></select></label>
          <label className="f">Audience<select id="c-aud" value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })}><option value="all">Everyone who agreed to marketing</option><option value="lapsed">Haven’t booked in 60 days</option><option value="domestic">Home customers</option><option value="commercial">Business customers</option></select></label>
          <label className="f">Send at (optional)<input id="c-when" type="datetime-local" value={f.sendAt} onChange={(e) => setF({ ...f, sendAt: e.target.value })} /></label>
        </div>
        {f.channel === "email" && <label className="f">Subject line<input id="c-subj" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></label>}
        <label className="f">Message<textarea id="c-body" rows={5} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></label>
        {msg && <p className="small" role="status">{msg}</p>}
        <div className="row"><button className="btn" onClick={() => save(true)}>Save draft</button><button className="btn dark" onClick={() => save(false)}>{f.sendAt ? "Schedule" : "Send"}</button></div>
      </section>
      <div className="card tablewrap" style={{ padding: 0 }}>
        <table className="t"><thead><tr><th>Campaign</th><th>Type</th><th>Status</th><th className="num">Reached</th><th className="num">Clicks</th><th className="num">Bookings</th></tr></thead>
          <tbody>{list.map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.channel} · {c.platform === "own" ? "built in" : c.platform}</td><td>{c.status}</td><td className="num">{c.reached}</td><td className="num">{c.clicks}</td><td className="num">{c.bookings}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

export default function Page() {
  return <BizShell>{(bid) => <Campaigns bid={bid} />}</BizShell>;
}
