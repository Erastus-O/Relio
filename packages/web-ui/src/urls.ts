/** Where each Relio web app lives, so they can link to one another. */
export const URLS = {
  website: process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000",
  customer: process.env.NEXT_PUBLIC_CUSTOMER_URL ?? "http://localhost:3001",
  business: process.env.NEXT_PUBLIC_BUSINESS_URL ?? "http://localhost:3002",
  admin: process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3003",
};
