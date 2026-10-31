import { BASE, URLS } from "../urls";

export const metadata = { title: "Talk to sales · Relio" };

export default function Contact() {
  return (
    <>
      <header className="nav"><div className="wrap">
        <a className="logo" href={`${BASE}/`} aria-label="Relio home"><i aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M4 20h16" /><path d="M7 20V9l5-5 5 5v11" /><path d="M10 14l1.5 1.5L15 12" /></svg></i>Relio</a>
        <div className="right"><a className="plain" href={URLS.customer}>Log in</a><a className="btn dark sm" href={URLS.demo} target="_blank" rel="noopener">Try the demo</a></div>
      </div></header>
      <main className="wrap">
        <section className="panel final center" aria-labelledby="h-contact">
          <h2 id="h-contact">Talk to sales</h2>
          <p className="lede">Tell us about your locations and team size, and we’ll put together Enterprise pricing: several locations under one account, custom roles and single sign-on, and a dedicated account manager.</p>
          <div className="ctas"><a className="btn dark" href="mailto:sales@relio.example">Email sales@relio.example</a><a className="btn light" href={`${BASE}/#pricing`}>Compare plans →</a></div>
        </section>
      </main>
    </>
  );
}
