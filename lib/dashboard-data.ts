import "server-only";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { ContactLead, DashboardUser } from "@/lib/dashboard-types";
import type { PublicCar } from "@/lib/types";

function toMillis(value: unknown): number {
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

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
    image: images?.[0] ?? (data.image as string) ?? "",
    images,
    imagePaths,
    featured: Boolean(data.featured),
    features,
    description: (data.description as string) ?? undefined,
  };
}

// The dashboard manages the same `cars` collection that powers the public
// site (lib/public-inventory.ts) — one inventory, not two.
export async function getVehicleCount(): Promise<number> {
  const snapshot = await getAdminDb().collection("cars").count().get();
  return snapshot.data().count;
}

export async function getRecentVehicles(max = 5): Promise<PublicCar[]> {
  const snapshot = await getAdminDb().collection("cars").orderBy("createdAt", "desc").limit(max).get();
  return snapshot.docs.map((doc) => mapCarDoc(doc.id, doc.data()));
}

export async function getAllVehicles(): Promise<PublicCar[]> {
  const snapshot = await getAdminDb().collection("cars").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => mapCarDoc(doc.id, doc.data()));
}

export async function getContactCount(): Promise<number> {
  const snapshot = await getAdminDb().collection("contacts").count().get();
  return snapshot.data().count;
}

export async function getMonthlyContactCount(): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const snapshot = await getAdminDb()
    .collection("contacts")
    .where("createdAt", ">=", startOfMonth)
    .count()
    .get();
  return snapshot.data().count;
}

export async function getRecentContacts(max = 5): Promise<ContactLead[]> {
  const snapshot = await getAdminDb()
    .collection("contacts")
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      message: data.message ?? "",
      vehicleOfInterest: data.vehicleOfInterest,
      createdAt: toMillis(data.createdAt),
    };
  });
}

export async function getAllContacts(): Promise<ContactLead[]> {
  const snapshot = await getAdminDb().collection("contacts").orderBy("createdAt", "desc").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      message: data.message ?? "",
      vehicleOfInterest: data.vehicleOfInterest,
      createdAt: toMillis(data.createdAt),
    };
  });
}

export async function getUserCount(): Promise<number> {
  const auth = await getAdminAuth();
  const result = await auth.listUsers(1000);
  return result.users.length;
}

export async function getAllUsers(): Promise<DashboardUser[]> {
  const auth = await getAdminAuth();
  const result = await auth.listUsers(1000);
  return result.users.map((user) => ({
    uid: user.uid,
    email: user.email ?? null,
    createdAt: user.metadata.creationTime ? Date.parse(user.metadata.creationTime) : null,
    lastSignInAt: user.metadata.lastSignInTime ? Date.parse(user.metadata.lastSignInTime) : null,
  }));
}
