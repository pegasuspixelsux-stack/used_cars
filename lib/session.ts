import "server-only";
import { getAdminAuth } from "@/lib/firebase-admin";

export const SESSION_COOKIE_NAME = "__session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Exchanges a client-side Firebase ID token for a long-lived session cookie value. */
export async function createSessionCookie(idToken: string): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

/** Verifies a session cookie value server-side. Returns the decoded claims, or null. */
export async function verifySessionCookie(cookieValue: string | undefined) {
  if (!cookieValue) return null;
  try {
    return await getAdminAuth().verifySessionCookie(cookieValue, true);
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_MS / 1000;

/**
 * Server Functions run as their own POST endpoints and are NOT covered by
 * proxy.ts if its matcher ever changes — verify the session inside every
 * mutating Server Action too, not just at the route level.
 */
export async function requireSession() {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const claims = await verifySessionCookie(store.get(SESSION_COOKIE_NAME)?.value);
  if (!claims) throw new Error("No autorizado. Inicie sesión nuevamente.");
  return claims;
}
