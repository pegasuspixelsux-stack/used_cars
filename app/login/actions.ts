"use server";

import { cookies } from "next/headers";
import { createSessionCookie, sessionCookieOptions, SESSION_MAX_AGE_SECONDS } from "@/lib/session";

/**
 * Exchanges a Firebase ID token (obtained client-side after
 * signInWithEmailAndPassword) for an httpOnly session cookie. The ID token
 * itself is short-lived and never stored — only the session cookie is.
 */
export async function createSession(idToken: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const sessionCookie = await createSessionCookie(idToken);
    const store = await cookies();
    store.set({
      ...sessionCookieOptions(SESSION_MAX_AGE_SECONDS),
      value: sessionCookie,
    });
    return { ok: true };
  } catch (err) {
    console.error("createSession failed:", err); // TODO: remove after debugging
    return { ok: false, error: "No se pudo iniciar sesión. Intente nuevamente." };
  }
}
