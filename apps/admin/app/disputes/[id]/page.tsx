"use client";
import { useEffect, useState } from "react";
import { formatGBP } from "@relio/shared";
import { api, Shell, AuthImage, BeforeAfterRooms, type EvidenceRoom } from "@relio/web-ui";

interface Dispute {
  ref: string; issue: string; amount: number; status: string; openedAt: string; ageDays: number; outcome: string | null; evidenceUnlocksOn: string | null;
  timeline: { at: string; who: string; text: string }[];
  evidence: null | { startsAt: string; service: string; photoPermission: string; checkinAt: string | null; checkoutAt: string | null; crew: { name: string }[]; customerPhotos: { id: string; url: string; room: string | null }[]; rooms: EvidenceRoom[] };
}

function Detail({ id }: { id: string }) {
  const [d, setD] = useState<Dispute | null>(null);
  const [outcome, setOutcome] = useState<"full" | "partial" | "none">("partial");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const load = () => api<Dispute>(`/admin/disputes/${id}`).then(setD);
  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  async function decide() {
    setErr("");
    try { await api(`/admin/disputes/${id}/decision`, { method: "POST", json: { outcome, note, amount: outcome === "partial" ? Math.round(Number(amount) * 100) : undefined } }); load(); } catch (e) { setErr((e as Error).message); }
  }
  if (!d) return <p>Loading…</p>;
  const ev = d.evidence;
  return (
    <>
      <div><h1>{d.ref} · {d.issue}</h1><p className="muted">{formatGBP(d.amount)} · opened {new Date(d.openedAt).toLocaleDateString("en-GB")} · open {d.ageDays} days</p></div>
      <div className="grid2">
        <section className="card stack"><h2 style={{ fontSize: 18 }}>What happened</h2>{d.timeline.map((t, i) => <div key={i} className="small"><b>{t.who}</b> · {new Date(t.at).toLocaleDateString("en-GB")}<div>{t.text}</div></div>)}</section>
        <section className="card stack">
          {d.status === "resolved" ? <p><b>Resolved.</b> {d.outcome}</p> : (
            <>
              <h2 style={{ fontSize: 18 }}>Decide</h2>
              {(["full", "partial", "none"] as const).map((o) => <label key={o} className="row"><input type="radio" name="out" checked={outcome === o} onChange={() => setOutcome(o)} /> {o === "full" ? "Full refund" : o === "partial" ? "Partial refund" : "No refund · business upheld"}</label>)}
              {outcome === "partial" && <label className="f">Amount (£)<input id="amt" type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} /></label>}
              <label className="f">Decision note (both sides see this)<textarea id="dnote" rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></label>
              {err && <p className="err" role="alert">{err}</p>}
              <button className="btn dark" onClick={decide}>Send decision</button>
            </>
          )}
        </section>
      </div>
      <section className="stack">
        <h2>Booking evidence</h2>
        {ev ? (
          <>
            <p className="small muted">Shown because this dispute has been open longer than the limit. Your viewing is recorded in the audit log.</p>
            <p className="small">{ev.service} · {new Date(ev.startsAt).toLocaleString("en-GB")} · crew {ev.crew.map((c) => c.name).join(", ")} · check-in {ev.checkinAt ? new Date(ev.checkinAt).toLocaleTimeString("en-GB") : "not recorded"} · photos {ev.photoPermission}</p>
            {ev.customerPhotos.length > 0 && <div className="row">{ev.customerPhotos.map((p) => <figure key={p.id} className="ba-shot" style={{ width: 140 }}><AuthImage src={p.url} alt="Customer photo" /><figcaption>Customer · {p.room}</figcaption></figure>)}</div>}
            <BeforeAfterRooms rooms={ev.rooms} photosAllowed={ev.photoPermission === "allowed"} started={Boolean(ev.checkinAt)} />
          </>
        ) : <p className="muted">{d.evidenceUnlocksOn ? `Booking evidence unlocks for admins on ${new Date(d.evidenceUnlocksOn).toLocaleDateString("en-GB")} if the dispute is still open.` : "No booking is linked to this dispute."}</p>}
      </section>
    </>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  return <Shell area="Admin" links={[["/", "Overview"]]} need={(me) => Boolean(me.admin)}>{() => <Detail id={params.id} />}</Shell>;
}
