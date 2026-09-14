"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
