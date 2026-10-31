import Script from "next/script";
import { siteMarkup, siteScript } from "./site";

export default function Home() {
  return (
    <>
      {/* The design's own scripts run the interactive demos, so React leaves this markup alone. */}
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: siteMarkup() }} />
      <Script id="relio-site" strategy="afterInteractive">{siteScript()}</Script>
    </>
  );
}
