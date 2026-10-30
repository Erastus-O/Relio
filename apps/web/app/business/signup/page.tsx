"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api";

const SERVICES = [["regular", "Regular home clean"], ["deep", "Deep clean"], ["eot", "End of tenancy clean"]] as const;

export default function Signup() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", basePostcode: "", coverage: "", services: ["regular"] as string[] });
  const [err, setErr] = useState("");
  async function submit() {
    setErr("");
    if (!getToken()) return router.push("/login?next=/business/signup");
    try {
      const b = await api<{ id: string }>("/businesses", {
        method: "POST",
        json: {
          name: f.name, basePostcode: f.basePostcode, coverage: f.coverage.split(/[\s,]+/).filter(Boolean),
          services: f.services.map((k) => ({ name: SERVICES.find((s) => s[0] === k)![1], catalogueKey: k, pricingModel: { model: "fixed_size" } })),
        },
      });
      try { localStorage.setItem("relio-business", b.id); } catch { /* ignore */ }
      router.push("/business");
    } catch (e) { setErr((e as Error).message); }
  }
  return (
    <main className="wrap" style={{ maxWidth: 560, padding: "60px 16px" }}>
      <div className="card stack">
        <h1 style={{ fontSize: 26 }}>Set up your business</h1>
        <label className="f">Business name<input id="b-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="f">Base postcode<input id="b-pc" value={f.basePostcode} onChange={(e) => setF({ ...f, basePostcode: e.target.value })} /></label>
        <label className="f">Postcode areas you cover<input id="b-cov" value={f.coverage} onChange={(e) => setF({ ...f, coverage: e.target.value })} placeholder="e.g. PE1, PE2, PE6" /></label>
        <fieldset style={{ border: 0, padding: 0 }} className="stack"><legend className="small"><b>Services</b></legend>
          {SERVICES.map(([k, l]) => <label key={k} className="row"><input type="checkbox" checked={f.services.includes(k)} onChange={(e) => setF({ ...f, services: e.target.checked ? [...f.services, k] : f.services.filter((x) => x !== k) })} /> {l}</label>)}
        </fieldset>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn dark" onClick={submit}>Create business</button>
        <p className="small muted">Next, verify your business (ID, Companies House, insurance and bank details) so you can publish your services.</p>
      </div>
    </main>
  );
}
