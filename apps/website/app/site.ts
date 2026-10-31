import { readFileSync } from "node:fs";
import { join } from "node:path";
import photo5 from "../site/img/photo-5.jpg";
import { URLS } from "./urls";

/**
 * The website design lives in site/ as plain HTML, CSS and JavaScript, taken from
 * prototype/website.html. This reads it at build time and points the design's
 * links at the customer, business and admin apps.
 */
const read = (f: string) => readFileSync(join(process.cwd(), "site", f), "utf8");

const NEW_TAB = ' target="_blank" rel="noopener"';

/** Replaces every match, and fails the build if the design no longer contains it. */
function swap(text: string, find: string | RegExp, to: string): string {
  const re = typeof find === "string" ? new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g") : find;
  if (!re.test(text)) throw new Error(`Website design no longer contains ${find}`);
  re.lastIndex = 0;
  return text.replace(re, to);
}

export function siteMarkup(): string {
  let html = read("markup.html");
  html = swap(html, `href="platform-prototype.html"${NEW_TAB}>Log in`, `href="${URLS.customer}">Log in`);
  html = swap(html, `href="platform-prototype.html"${NEW_TAB}>Try the demo`, `href="${URLS.demo}"${NEW_TAB}>Try the demo`);
  html = swap(html, `href="platform-prototype.html"${NEW_TAB}>Demo`, `href="${URLS.demo}"${NEW_TAB}>Demo`);
  html = swap(html, /href="platform-prototype\.html" target="_blank" rel="noopener">(List your business →|Get started|Start 30-day trial)/g, `href="${URLS.business}">$1`);
  html = swap(html, `<a href="#top">Contact</a>`, `<a href="${URLS.contact}">Contact</a>`);
  html = swap(html, `href="#top">Talk to sales`, `href="${URLS.contact}">Talk to sales`);
  html = swap(html, `src="/img/photo-5.jpg"`, `src="${photo5.src}"`);
  if (html.includes("platform-prototype.html")) throw new Error("Website design has a link to platform-prototype.html that isn't mapped to an app");
  return html;
}

export function siteScript(): string {
  return swap(
    read("site.js"),
    `href="\${i===3?'#top':'platform-prototype.html'}" \${i===3?'':'target="_blank" rel="noopener"'}`,
    `href="\${i===3?'${URLS.contact}':'${URLS.business}'}"`,
  );
}
