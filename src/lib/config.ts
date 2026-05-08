import { APP_NAME, APP_TAGLINE } from "./types";

export const config = {
  appName: APP_NAME,
  appTagline: APP_TAGLINE,
  adminPassword: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export function getNodeUrl(slug: string) {
  return `${getBaseUrl()}/node/${slug}`;
}

export function getChainUrl(slug: string) {
  return `${getBaseUrl()}/chain/${slug}`;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  const stored = localStorage.getItem("session_id");
  if (stored) return stored;

  const newId = crypto.randomUUID();
  localStorage.setItem("session_id", newId);
  return newId;
}