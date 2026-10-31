"use client";

export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function getToken(): string | null {
  try {
    return localStorage.getItem("relio-token");
  } catch {
    return null;
  }
}
export function setToken(t: string | null) {
  try {
    if (t) localStorage.setItem("relio-token", t);
    else localStorage.removeItem("relio-token");
  } catch {
    /* storage unavailable */
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let body = init.body;
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }
  const res = await fetch(`${API}${path}`, { ...init, headers, body });
  const ct = res.headers.get("content-type") ?? "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string })?.error ?? `Request failed (${res.status})`, data);
  return data as T;
}

/** Downloads a protected file (photo, document, CSV) with the auth header. */
export async function fetchBlob(path: string): Promise<Blob> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new ApiError(res.status, "Couldn't load the file.");
  return res.blob();
}

export interface Me {
  user: { id: string; email: string; name: string | null };
  businesses: { id: string; name: string; role: string; plan: string; status: string }[];
  proBusinesses: { proId: string; businessId: string; business: string; role: string; status: string }[];
  customer: { id: string } | null;
  admin: { role: string } | null;
}
