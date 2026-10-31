"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@relio/web-ui";

interface Listing { id: string; name: string; category: string; bookingMode: string; business: { name: string; rating: number | null } }

export default function Search() {
  const [pc, setPc] = useState("");
  const [list, setList] = useState<Listing[] | null>(null);
  const [err, setErr] = useState("");
  async function search() {
    setErr("");
    try { setList(await api<Listing[]>(`/marketplace/services?postcode=${encodeURIComponent(pc)}`)); } catch (e) { setErr((e as Error).message); }
  }
  return (
    <main className="wrap stack" style={{ padding: "40px 16px" }}>
      <h1>Find a service near you</h1>
      <div className="row"><label className="f">Postcode<input id="pc" value={pc} onChange={(e) => setPc(e.target.value)} placeholder="e.g. PE6 0JH" /></label><button className="btn dark" onClick={search} style={{ alignSelf: "flex-end" }}>Search</button></div>
      {err && <p className="err">{err}</p>}
      {list && (list.length ? (
        <div className="grid2">{list.map((s) => (
          <article key={s.id} className="card stack">
            <div><h3>{s.name}</h3><p className="small muted">{s.business.name}{s.business.rating ? ` · ★ ${s.business.rating}` : ""}</p></div>
            <Link className="btn dark" href={`/book/${s.id}`}>{s.bookingMode === "quote" ? "Request a quote" : "Book"}</Link>
          </article>))}
        </div>
      ) : <p className="muted">No business covers that postcode yet.</p>)}
    </main>
  );
}
