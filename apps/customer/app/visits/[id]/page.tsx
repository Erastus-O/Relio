"use client";
import { useEffect, useState } from "react";
import { api, Shell, BeforeAfterRooms, type EvidenceRoom } from "@relio/web-ui";

interface Visit { id: string; state: string; startsAt: string; service: string; photoPermission: string; checkinAt: string | null; crew: { name: string }[]; rooms: EvidenceRoom[] }

function Report({ id }: { id: string }) {
  const [v, setV] = useState<Visit | null>(null);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => { api<Visit>(`/customer/visits/${id}`).then(setV); }, [id]);
  if (!v) return <p>Loading…</p>;
  async function raise() {
    try { await api(`/customer/visits/${id}/concerns`, { method: "POST", json: { text } }); setMsg("Sent. The business will reply here."); setText(""); } catch (e) { setMsg((e as Error).message); }
  }
  return (
    <>
      <div><h1>{v.service}</h1><p className="muted">{new Date(v.startsAt).toLocaleString("en-GB")} · {v.crew.map((c) => c.name.split(" ")[0]).join(", ") || "Team to be confirmed"}</p></div>
      <BeforeAfterRooms rooms={v.rooms} photosAllowed={v.photoPermission === "allowed"} started={Boolean(v.checkinAt)} />
      <section className="card stack">
        <h2 style={{ fontSize: 18 }}>Raise a concern</h2>
        <textarea id="concern" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tell the business what wasn’t right" />
        {msg && <p className="small" role="status">{msg}</p>}
        <button className="btn dark" onClick={raise} disabled={text.length < 10}>Send</button>
      </section>
    </>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  return <Shell area="Customer" links={[["/", "Bookings"], ["/book", "Book a service"]]}>{() => <Report id={params.id} />}</Shell>;
}
