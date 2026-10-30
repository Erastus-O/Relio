"use client";
import { AuthImage } from "./AuthImage";

export interface EvidencePhoto { id: string; url: string; takenAt: string; fromCustomer?: boolean }
export interface EvidenceTask { id: string; name: string; result: string | null; reason: string | null; custom: boolean; before: EvidencePhoto[]; after: EvidencePhoto[]; missingPhotos: string[] }
export interface EvidenceRoom { room: string; tasks: EvidenceTask[] }

const time = (s: string) => new Date(s).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const resultLabel: Record<string, [string, string]> = { done: ["Done", "good"], not_done: ["Not done", "bad"], na: ["Not applicable", ""] };

/** Room cards with a before and after photo for every task. */
export function BeforeAfterRooms({ rooms, photosAllowed, started }: { rooms: EvidenceRoom[]; photosAllowed: boolean; started: boolean }) {
  const slot = (list: EvidencePhoto[], kind: "Before" | "After") =>
    list.length ? (
      list.map((p) => (
        <figure key={p.id} className="ba-shot">
          <AuthImage src={p.url} alt={`${kind} photo`} />
          <figcaption>{p.fromCustomer ? "From the customer" : time(p.takenAt)}</figcaption>
        </figure>
      ))
    ) : (
      <div className="ba-empty">{started ? `No ${kind.toLowerCase()} photo` : "Taken at the visit"}</div>
    );
  return (
    <div className="rooms">
      {rooms.map((r) => {
        const done = r.tasks.filter((t) => t.result).length;
        return (
          <section key={r.room} className="room">
            <header>
              <h3>{r.room}</h3>
              <span>{done}/{r.tasks.length}</span>
            </header>
            {r.tasks.map((t) => {
              const [label, tone] = t.result ? resultLabel[t.result] : ["Pending", ""];
              return (
                <div key={t.id} className="task">
                  <div className="task-top">
                    <span>{t.name}{t.custom && <em> · added by customer</em>}</span>
                    <span className={`pill ${tone}`}>{label}</span>
                  </div>
                  {t.reason && <p className="muted small">Reason: {t.reason}</p>}
                  {photosAllowed && (
                    <div className="ba">
                      <div><span className="ba-h">Before</span>{slot(t.before, "Before")}</div>
                      <div><span className="ba-h">After</span>{slot(t.after, "After")}</div>
                    </div>
                  )}
                  {t.missingPhotos.length > 0 && started && <p className="small bad-text">Missing: {t.missingPhotos.join(" and ")} photo</p>}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
