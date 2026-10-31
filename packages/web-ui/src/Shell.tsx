"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { setToken } from "./api";
import { useMe } from "./useMe";
import type { Me } from "./api";

/** Signed-in layout: side navigation for the app, sign-in redirect and an access check. */
export function Shell({ area, links, children, need, denied }: { area: string; links: [string, string][]; children: (me: Me) => React.ReactNode; need?: (me: Me) => boolean; denied?: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { me, error, loading } = useMe();
  useEffect(() => {
    if (error === "signin") router.push(`/login?next=${encodeURIComponent(path)}`);
  }, [error, path, router]);
  if (loading || !me) return <main className="wrap" style={{ padding: 40 }}>{error && error !== "signin" ? error : "Loading…"}</main>;
  if (need && !need(me)) return <main className="wrap stack" style={{ padding: 40 }}>{denied ?? <p>You don’t have access to this area.</p>}<button className="btn" onClick={() => { setToken(null); router.push("/login"); }}>Sign in as someone else</button></main>;
  return (
    <div className="shell">
      <nav className="side" aria-label="Sections">
        <Link href="/" style={{ fontWeight: 700, color: "var(--ink)" }}>Relio <span className="muted">{area}</span></Link>
        {links.map(([href, label]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>)}
        <button className="btn" style={{ marginTop: "auto" }} onClick={() => { setToken(null); router.push("/login"); }}>Sign out</button>
      </nav>
      <main className="main">{children(me)}</main>
    </div>
  );
}

/** Remembers which business a member is working in. */
export function currentBusiness(me: Me) {
  let id: string | null = null;
  try { id = localStorage.getItem("relio-business"); } catch { /* ignore */ }
  return me.businesses.find((b) => b.id === id) ?? me.businesses[0];
}
