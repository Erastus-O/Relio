import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relio",
  description: "Find, book and run local services: cleaning, repairs and tutoring.",
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
