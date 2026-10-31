"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatGBP } from "@relio/shared";
import { api, Shell } from "@relio/web-ui";

interface Row { id: string; startsAt: string; state: string; service: string; business: string; price: number }

function List() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => { api<Row[]>("/customer/bookings").then(setRows).catch(() => setRows([])); }, []);
  if (!rows) return <p>Loading…</p>;
  const now = Date.now();
  return (
    <div className="card tablewrap" style={{ padding: 0 }}>
      <table className="t">
        <thead><tr><th>When</th><th>Service</th><th>Business</th><th>Status</th><th className="num">Price</th><th /></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id}>
            <td>{new Date(r.startsAt).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{new Date(r.startsAt).getTime() >= now && <span className="pill good" style={{ marginLeft: 6 }}>Upcoming</span>}</td>
            <td>{r.service}</td><td>{r.business}</td><td>{r.state.replace("_", " ")}</td><td className="num">{formatGBP(r.price)}</td>
            <td><Link className="btn" href={`/visits/${r.id}`}>View</Link></td>
          </tr>))}
        </tbody>
      </table>
      {!rows.length && <p className="muted" style={{ padding: 16 }}>No bookings yet. <Link href="/book">Book a service</Link>.</p>}
    </div>
  );
}

export default function Account() {
  return <Shell area="Customer" links={[["/", "Bookings"], ["/book", "Book a service"]]}>{() => <><h1>Your bookings</h1><List /></>}</Shell>;
}
