/** Where the website is served from ("" locally, "/Relio" on GitHub Pages). */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Where each Relio app lives, so the website can link to them. */
export const URLS = {
  customer: process.env.NEXT_PUBLIC_CUSTOMER_URL ?? "http://localhost:3001",
  business: process.env.NEXT_PUBLIC_BUSINESS_URL ?? "http://localhost:3002",
  admin: process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3003",
  demo: `${BASE}/demo.html`,
  contact: `${BASE}/contact`,
};
