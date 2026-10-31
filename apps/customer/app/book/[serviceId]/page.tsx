"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatGBP, type Quote } from "@relio/shared";
import { api, getToken, API } from "@relio/web-ui";

interface CatTask { key: string; room: string; name: string }
interface ServiceInfo { id: string; name: string; business: { name: string }; tasks: { maxTasks: number; notIncluded: string[]; items: CatTask[] } | null }
interface Uploaded { id: string; room: string; url: string; preview: string }

export default function Book({ params }: { params: { serviceId: string } }) {
  const router = useRouter();
  const [svc, setSvc] = useState<ServiceInfo | null>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [custom, setCustom] = useState<{ room: string; name: string }[]>([]);
  const [newRoom, setNewRoom] = useState("Kitchen");
  const [newName, setNewName] = useState("");
  const [photoPermission, setPhotoPermission] = useState<"allowed" | "none">("allowed");
  const [photos, setPhotos] = useState<Uploaded[]>([]);
  const [photoRoom, setPhotoRoom] = useState("Kitchen");
  const [size, setSize] = useState<"studio" | "1" | "2" | "3" | "4" | "5">("2");
  const [bathrooms, setBathrooms] = useState(1);
  const [frequency, setFrequency] = useState<"once" | "weekly" | "fortnightly" | "monthly">("once");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [when, setWhen] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => { api<ServiceInfo>(`/services/${params.serviceId}`).then(setSvc).catch((e) => setErr(e.message)); }, [params.serviceId]);

  const rooms = useMemo(() => [...new Set(svc?.tasks?.items.map((t) => t.room) ?? [])], [svc]);
  const count = (svc?.tasks?.items.length ?? 0) - removed.length + custom.length;
  const max = svc?.tasks?.maxTasks ?? 0;
  const full = count >= max;
  const serviceKey = (svc?.name.toLowerCase().includes("deep") ? "deep" : svc?.name.toLowerCase().includes("tenancy") ? "eot" : "regular") as "regular" | "deep" | "eot";
  const quoteInput = { service: serviceKey, size, bathrooms, condition: "average", frequency, addOns: [], ownSupplies: false, area: "main" };

  useEffect(() => {
    if (!svc) return;
    api<Quote>(`/services/${svc.id}/quote`, { method: "POST", json: quoteInput }).then(setQuote).catch(() => setQuote(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svc, size, bathrooms, frequency]);

  function toggle(key: string, checked: boolean) {
    if (checked && full) return;
    setRemoved((r) => (checked ? r.filter((k) => k !== key) : [...r, key]));
  }
  function addTask() {
    setErr("");
    if (newName.trim().length < 3) return setErr("Describe the task (at least 3 characters).");
    if (full) return setErr(`You can have up to ${max} tasks for this service.`);
    setCustom((c) => [...c, { room: newRoom, name: newName.trim() }]);
    setNewName("");
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    if (!getToken()) return router.push(`/login?next=/book/${params.serviceId}`);
    const fd = new FormData();
    const list = [...files].slice(0, 6 - photos.length);
    list.forEach((f) => { fd.append("photos", f); fd.append("rooms", photoRoom); });
    try {
      const up = await api<{ id: string; room: string; url: string }[]>("/customer/photos", { method: "POST", body: fd });
      setPhotos((p) => [...p, ...up.map((u, i) => ({ ...u, preview: URL.createObjectURL(list[i]) }))]);
    } catch (e) { setErr((e as Error).message); }
  }
  async function confirm() {
    setErr("");
    if (!getToken()) return router.push(`/login?next=/book/${params.serviceId}`);
    try {
      await api("/customer/bookings", {
        method: "POST",
        json: {
          serviceId: params.serviceId, quote: quoteInput, startsAt: new Date(when).toISOString(), photoPermission,
          site: { label: "Home", address, postcode }, tasks: { removed, custom }, beforePhotoIds: photos.map((p) => p.id),
        },
      });
      router.push("/");
    } catch (e) { setErr((e as Error).message); }
  }

  if (!svc) return <main className="wrap" style={{ padding: 40 }}>{err || "Loading…"}</main>;
  return (
    <main className="wrap stack" style={{ padding: "40px 16px" }}>
      <div><h1>Book {svc.name}</h1><p className="muted">{svc.business.name}</p></div>

      {svc.tasks && (
        <section className="card stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div><h2 style={{ fontSize: 20 }}>What’s included</h2><p className="small muted">Everything is ticked. Untick what you don’t need, or add your own tasks.</p></div>
            <span className={`pill ${full ? "warn" : ""}`}><b>{count}</b>&nbsp;of up to {max} tasks</span>
          </div>
          <div className="tkp-grid">
            {rooms.map((r) => (
              <div key={r} className="tkp-room">
                <b className="small">{r}</b>
                {svc.tasks!.items.filter((t) => t.room === r).map((t) => {
                  const on = !removed.includes(t.key);
                  return <label key={t.key} className="tkp-t"><input type="checkbox" checked={on} disabled={!on && full} onChange={(e) => toggle(t.key, e.target.checked)} /> {t.name}</label>;
                })}
                {custom.map((c, i) => c.room === r && (
                  <div key={i} className="tkp-t"><span>✓ {c.name} <em className="small muted">your task</em></span><button className="btn" style={{ height: 28, marginLeft: "auto" }} onClick={() => setCustom((x) => x.filter((_, j) => j !== i))}>Remove</button></div>
                ))}
              </div>
            ))}
          </div>
          {!full && (
            <div className="row">
              <label className="f">Room<select id="tk-room" value={newRoom} onChange={(e) => setNewRoom(e.target.value)}>{rooms.map((r) => <option key={r}>{r}</option>)}</select></label>
              <label className="f" style={{ flex: 1 }}>Add your own task<input id="tk-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Clean the conservatory floor" /></label>
              <button className="btn" onClick={addTask} style={{ alignSelf: "flex-end" }}>Add task</button>
            </div>
          )}
          <details className="small"><summary>Not included</summary><ul>{svc.tasks.notIncluded.map((x) => <li key={x}>{x}</li>)}</ul></details>
        </section>
      )}

      <section className="card stack">
        <h2 style={{ fontSize: 20 }}>Your home</h2>
        <div className="grid2">
          <label className="f">Property size<select id="size" value={size} onChange={(e) => setSize(e.target.value as typeof size)}>{["studio", "1", "2", "3", "4", "5"].map((s) => <option key={s} value={s}>{s === "studio" ? "Studio" : `${s} bedrooms`}</option>)}</select></label>
          <label className="f">Bathrooms<input id="baths" type="number" min={1} max={6} value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} /></label>
          <label className="f">Address<input id="addr" value={address} onChange={(e) => setAddress(e.target.value)} /></label>
          <label className="f">Postcode<input id="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} /></label>
        </div>
        <fieldset className="stack" style={{ border: 0, padding: 0 }}>
          <legend className="small"><b>Can your cleaner take photos of the work?</b></legend>
          <label className="row"><input type="radio" name="photo" checked={photoPermission === "allowed"} onChange={() => setPhotoPermission("allowed")} /> Yes, allow photos</label>
          <label className="row"><input type="radio" name="photo" checked={photoPermission === "none"} onChange={() => setPhotoPermission("none")} /> No photos in my home</label>
        </fieldset>
        <div className="stack">
          <b className="small">Photos of how it looks now (optional, up to 6)</b>
          <p className="small muted">They help your cleaner plan, and they’re kept as the “before” record for your booking.</p>
          <div className="row">
            {photos.map((p) => <img key={p.id} src={p.preview} alt={`Your photo: ${p.room}`} style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 8 }} />)}
            {photos.length < 6 && <select id="photo-room" aria-label="Room in the photos" value={photoRoom} onChange={(e) => setPhotoRoom(e.target.value)}>{[...rooms, "Other"].map((r) => <option key={r}>{r}</option>)}</select>}
            {photos.length < 6 && <label className="btn">Add photos<input type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} /></label>}
          </div>
        </div>
      </section>

      <section className="card stack">
        <h2 style={{ fontSize: 20 }}>When</h2>
        <div className="grid2">
          <label className="f">How often<select id="freq" value={frequency} onChange={(e) => setFrequency(e.target.value as typeof frequency)}>{["once", "weekly", "fortnightly", "monthly"].map((f) => <option key={f}>{f}</option>)}</select></label>
          <label className="f">Date and time<input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></label>
        </div>
        {quote && (
          <div className="stack small">
            {quote.lines.map((l) => <div key={l.label} className="row" style={{ justifyContent: "space-between" }}><span>{l.label}</span><span>{formatGBP(l.amount)}</span></div>)}
            <div className="row" style={{ justifyContent: "space-between", fontWeight: 600 }}><span>Total {frequency !== "once" ? "per visit" : ""}</span><span>{formatGBP(quote.total)}</span></div>
            {quote.firstVisitTotal && <p className="muted">First visit {formatGBP(quote.firstVisitTotal)} (one-off price).</p>}
          </div>
        )}
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn dark" onClick={confirm} disabled={!when || !address || !postcode}>Confirm and pay</button>
        <p className="small muted">Payments are taken by {API.includes("localhost") ? "the sandbox" : "our payment provider"}. You won’t be charged if the time is no longer available.</p>
      </section>
    </main>
  );
}
