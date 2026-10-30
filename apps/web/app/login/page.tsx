"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, setToken, type Me } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    setErr(""); setBusy(true);
    try {
      const r = await api<{ devCode?: string }>("/auth/code", { method: "POST", json: { email } });
      setStep(2);
      setInfo(`We’ve emailed a 6-digit code to ${email}.${r.devCode ? ` (Development code: ${r.devCode})` : ""}`);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  async function verify() {
    setErr(""); setBusy(true);
    try {
      const r = await api<{ token: string }>("/auth/verify", { method: "POST", json: { email, code } });
      setToken(r.token);
      const me = await api<Me>("/me");
      router.push(next ?? (me.admin ? "/admin" : me.businesses.length ? "/business" : "/account"));
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <main className="wrap" style={{ maxWidth: 420, padding: "80px 16px" }}>
      <div className="card stack">
        <h1 style={{ fontSize: 26 }}>{step === 1 ? "Sign in" : "Check your email"}</h1>
        <p className="muted small">We’ll email you a 6-digit code. No password to remember.</p>
        {info && <p className="small" role="status">{info}</p>}
        {step === 1 ? (
          <label className="f">Email<input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        ) : (
          <label className="f">6-digit code<input id="code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} /></label>
        )}
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn dark" disabled={busy} onClick={step === 1 ? send : verify}>{step === 1 ? "Email me a code" : "Sign in"}</button>
        {step === 2 && <button className="btn" onClick={() => setStep(1)}>Use a different email</button>}
      </div>
    </main>
  );
}

export default function Login() {
  return <Suspense><LoginForm /></Suspense>;
}
