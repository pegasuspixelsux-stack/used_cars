"use server";

import { revalidatePath } from "next/cache";
import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/session";

/**
 * Creating a car happens client-side now (components/AddCarModal.tsx) —
 * photo uploads go straight to Firebase Storage from the browser, and the
 * Firestore doc is written with the client SDK under firestore.rules'
 * `request.auth != null` check. That sidesteps Server Actions' default
 * ~1MB body limit, which multiple photos would blow through fast.
 *
 * Deleting stays server-side: no file upload involved, and doing it
 * through the Admin SDK means we don't need a client-facing delete rule.
 */
export async function deleteCar(id: string, imagePaths?: string[]): Promise<void> {
  await requireSession();

  await getAdminDb().collection("cars").doc(id).delete();

  if (imagePaths?.length) {
    const bucket = getAdminStorage().bucket();
    await Promise.all(
      imagePaths.map((path) => bucket.file(path).delete().catch(() => {})),
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inventario");
  revalidatePath("/");
}
