"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BizShell } from "@/components/BizShell";
import { VisitEvidence } from "@/components/VisitEvidence";

function Queue({ bid }: { bid: string }) {
  const [q, setQ] = useState<{ id: string; site: { label: string } }[] | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const load = () => api<{ id: string; site: { label: string } }[]>(`/business/${bid}/quality/queue`).then((x) => { setQ(x); setSel(x[0]?.id ?? null); }).catch(() => setQ([]));
  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bid]);
  if (!q) return <p>Loading…</p>;
  return (
    <>
      <h1>Quality review</h1>
      {!q.length && <p className="muted">No submitted visits waiting for review.</p>}
      <div className="row">{q.map((v) => <button key={v.id} className={`btn ${sel === v.id ? "dark" : ""}`} onClick={() => setSel(v.id)}>{v.site.label}</button>)}</div>
      {sel && <VisitEvidence key={sel} bid={bid} id={sel} onReviewed={load} />}
    </>
  );
}

export default function Page() {
  return <BizShell>{(bid) => <Queue bid={bid} />}</BizShell>;
}
