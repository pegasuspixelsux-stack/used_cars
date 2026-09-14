"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/session";

export async function createVehicle(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireSession();

  const make = String(formData.get("make") || "").trim();
  const model = String(formData.get("model") || "").trim();
  const year = Number(formData.get("year"));
  const priceUsd = Number(formData.get("priceUsd"));
  const file = formData.get("image");

  if (!make || !model || !year || !priceUsd) {
    return { ok: false, error: "Complete todos los campos requeridos." };
  }

  let imageUrl: string | undefined;
  let imagePath: string | undefined;

  if (file instanceof File && file.size > 0) {
    const bucket = getAdminStorage().bucket();
    imagePath = `vehicles/${randomUUID()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const bucketFile = bucket.file(imagePath);
    await bucketFile.save(buffer, { metadata: { contentType: file.type } });
    await bucketFile.makePublic();
    imageUrl = `https://storage.googleapis.com/${bucket.name}/${imagePath}`;
  }

  await getAdminDb().collection("vehicles").add({
    make,
    model,
    year,
    priceUsd,
    imageUrl,
    imagePath,
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inventario");
  return { ok: true };
}

export async function deleteVehicle(id: string, imagePath?: string): Promise<void> {
  await requireSession();

  await getAdminDb().collection("vehicles").doc(id).delete();

  if (imagePath) {
    await getAdminStorage()
      .bucket()
      .file(imagePath)
      .delete()
      .catch(() => {});
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inventario");
}
