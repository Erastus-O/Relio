import { useEffect, useRef } from "react";

window.__CP_API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function mountSite(host, html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("link[rel=stylesheet], link[rel=preconnect], style").forEach((n) => document.head.appendChild(n));
  const title = doc.querySelector("title");
  if (title) document.title = title.textContent;
  const scripts = [...doc.body.querySelectorAll("script")];
  scripts.forEach((s) => s.remove());
  doc.body.querySelectorAll("meta, title, link, style").forEach((n) => n.remove());
  host.innerHTML = doc.body.innerHTML;
  scripts.forEach((s) => {
    const el = document.createElement("script");
    el.textContent = s.textContent;
    document.body.appendChild(el);
  });
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
}

export default function App() {
  const ref = useRef(null);
  useEffect(() => {
    if (window.__cpMounted) return;
    window.__cpMounted = true;
    fetch("/site.html").then((r) => r.text()).then((html) => mountSite(ref.current, html));
  }, []);
  return <div ref={ref} data-testid="site-root" />;
}
