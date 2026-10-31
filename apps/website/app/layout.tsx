import type { Metadata } from "next";
import "../site/site.css";

export const metadata: Metadata = {
  title: "Relio",
  description: "A marketplace and operations platform for service businesses: find local pros, book or request a quote, and run rotas, evidence, invoicing and payroll.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Roboto:wght@400;500&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
