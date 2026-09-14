"use server";

import { revalidatePath } from "next/cache";
import { getAdminAuth } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/session";

export async function createUser(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireSession();

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || password.length < 6) {
    return { ok: false, error: "Ingrese un correo válido y una contraseña de al menos 6 caracteres." };
  }

  try {
    await getAdminAuth().createUser({ email, password });
  } catch {
    return { ok: false, error: "No se pudo crear el usuario. ¿Ya existe esa cuenta?" };
  }

  revalidatePath("/dashboard/usuarios");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteUser(uid: string): Promise<void> {
  const claims = await requireSession();
  if (claims.uid === uid) return; // never let an admin delete their own active session

  await getAdminAuth().deleteUser(uid);
  revalidatePath("/dashboard/usuarios");
  revalidatePath("/dashboard");
}
