"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AuthImage } from "./AuthImage";
import { BeforeAfterRooms, type EvidenceRoom } from "./BeforeAfter";

interface Visit {
  id: string; state: string; startsAt: string; service: string; site: { label: string; address: string }; photoPermission: string;
  checkinAt: string | null; checkoutAt: string | null; crew: { name: string }[]; customerPhotos: { id: string; url: string; room: string | null }[]; rooms: EvidenceRoom[];
}

export function VisitEvidence({ bid, id, onReviewed }: { bid: string; id: string; onReviewed?: () => void }) {
  const [v, setV] = useState<Visit | null>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { api<Visit>(`/business/${bid}/visits/${id}`).then(setV).catch((e) => setErr(e.message)); }, [bid, id]);
  async function review(outcome: "accept" | "correct" | "fail") {
    setErr("");
    try { await api(`/business/${bid}/visits/${id}/review`, { method: "POST", json: { outcome, note: note || undefined } }); onReviewed?.(); setV(await api<Visit>(`/business/${bid}/visits/${id}`)); } catch (e) { setErr((e as Error).message); }
  }
  if (!v) return <p>{err || "Loading…"}</p>;
  return (
    <section className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div><h2>{v.site.label} · {v.service}</h2><p className="small muted">{v.site.address} · {new Date(v.startsAt).toLocaleString("en-GB")} · {v.crew.map((c) => c.name).join(", ") || "No crew"}</p></div>
        <span className={`pill ${v.photoPermission === "allowed" ? "good" : "warn"}`}>{v.photoPermission === "allowed" ? "Photos allowed" : "No photos allowed"}</span>
      </div>
      <div className="stack">
        <b className="small">Customer’s photos before the visit</b>
        {v.customerPhotos.length ? (
          <div className="row">{v.customerPhotos.map((p) => <figure key={p.id} className="ba-shot" style={{ width: 140 }}><AuthImage src={p.url} alt={`Customer photo: ${p.room ?? ""}`} /><figcaption>Before · {p.room}</figcaption></figure>)}</div>
        ) : <p className="small muted">The customer didn’t add photos when booking.</p>}
      </div>
      <BeforeAfterRooms rooms={v.rooms} photosAllowed={v.photoPermission === "allowed"} started={Boolean(v.checkinAt)} />
      {v.state === "submitted" && (
        <div className="card stack">
          <label className="f">Note to the pro or for the report<input id="revnote" value={note} onChange={(e) => setNote(e.target.value)} /></label>
          {err && <p className="err" role="alert">{err}</p>}
          <div className="row"><button className="btn dark" onClick={() => review("accept")}>Accept and complete</button><button className="btn" onClick={() => review("correct")}>Request correction</button><button className="btn" onClick={() => review("fail")}>Mark failed</button></div>
        </div>
      )}
    </section>
  );
}

