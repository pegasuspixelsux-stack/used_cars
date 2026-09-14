"use server";

import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/session";

export async function deleteContact(id: string): Promise<void> {
  await requireSession();
  await getAdminDb().collection("contacts").doc(id).delete();
  revalidatePath("/dashboard/contactos");
  revalidatePath("/dashboard");
}
