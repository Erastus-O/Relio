import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

export const API_URL: string = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ?? "http://localhost:4000";

let token: string | null = null;
export async function loadToken() {
  token = await SecureStore.getItemAsync("relio-token");
  return token;
}
export async function saveToken(t: string | null) {
  token = t;
  if (t) await SecureStore.setItemAsync("relio-token", t);
  else await SecureStore.deleteItemAsync("relio-token");
}
export const authHeader = (): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {});

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: { problems?: string[] }) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, opts: { method?: string; json?: unknown; form?: FormData } = {}): Promise<T> {
  const headers: Record<string, string> = { ...authHeader() };
  let body: BodyInit | undefined;
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  } else if (opts.form) body = opts.form;
  const res = await fetch(`${API_URL}${path}`, { method: opts.method ?? (body ? "POST" : "GET"), headers, body });
  const data = res.headers.get("content-type")?.includes("json") ? await res.json() : null;
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`, data);
  return data as T;
}

/** Adds a photo picked from the camera or library to a multipart form. */
export function appendImage(form: FormData, field: string, uri: string, name = "photo.jpg") {
  // React Native's FormData accepts { uri, name, type } objects for files.
  form.append(field, { uri, name, type: name.endsWith(".png") ? "image/png" : "image/jpeg" } as unknown as Blob);
}

export const photoUrl = (path: string) => ({ uri: `${API_URL}${path}`, headers: authHeader() });
