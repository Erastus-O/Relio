"use client";
import { useEffect, useState } from "react";
import { fetchBlob } from "./api";

/** <img> for photos served by the API, which need the sign-in token. */
export function AuthImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let revoke: string | null = null;
    fetchBlob(src)
      .then((b) => setUrl((revoke = URL.createObjectURL(b))))
      .catch(() => setUrl(null));
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [src]);
  return url ? <img src={url} alt={alt} className={className} /> : <div className={`${className ?? ""} ph`} aria-label={alt} />;
}
