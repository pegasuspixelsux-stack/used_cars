import "server-only";
import { getAdminDb } from "@/lib/firebase-admin";
import type { PublicCar } from "@/lib/types";

function mapCarDoc(id: string, data: Record<string, unknown>): PublicCar {
  const images = Array.isArray(data.images) ? (data.images as string[]) : undefined;
  const imagePaths = Array.isArray(data.imagePaths) ? (data.imagePaths as string[]) : undefined;
  const features = Array.isArray(data.features) ? (data.features as string[]) : undefined;

  return {
    id,
    make: (data.make as string) ?? "",
    model: (data.model as string) ?? "",
    year: (data.year as number) ?? 0,
    price: (data.price as number) ?? 0,
    mileage: (data.mileage as number) ?? 0,
    transmission: (data.transmission as PublicCar["transmission"]) ?? "Automática",
    fuelType: (data.fuelType as PublicCar["fuelType"]) ?? "Nafta",
    color: (data.color as string) ?? "",
    // Legacy seed docs only ever set `image` (singular) — fall back to it
    // when a newer doc's `images` array hasn't been set for some reason.
    image: images?.[0] ?? (data.image as string) ?? "",
    images,
    imagePaths,
    featured: Boolean(data.featured),
    features,
    description: (data.description as string) ?? undefined,
  };
}

/**
 * Live inventory for the public marketing site, read from Firestore's
 * `cars` collection — seeded via scripts/seedCars.mts, and managed day to
 * day through /dashboard/inventario (components/AddCarModal.tsx).
 *
 * Wrapped in try/catch rather than letting it throw: this runs during
 * `next build`'s prerender too, and a page that can't reach Firestore
 * should render an empty state, not fail the whole build.
 */
export async function getPublicInventory(): Promise<PublicCar[]> {
  try {
    const snapshot = await getAdminDb().collection("cars").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => mapCarDoc(doc.id, doc.data()));
  } catch (error) {
    console.error("getPublicInventory: could not read Firestore, showing empty inventory", error);
    return [];
  }
}

export async function getPublicCarById(id: string): Promise<PublicCar | null> {
  try {
    const doc = await getAdminDb().collection("cars").doc(id).get();
    if (!doc.exists) return null;
    return mapCarDoc(doc.id, doc.data() ?? {});
  } catch (error) {
    console.error(`getPublicCarById(${id}): could not read Firestore`, error);
    return null;
  }
}
