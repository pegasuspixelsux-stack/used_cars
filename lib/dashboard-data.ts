import "server-only";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { ContactLead, DashboardUser, DashboardVehicle } from "@/lib/dashboard-types";

function toMillis(value: unknown): number {
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export async function getVehicleCount(): Promise<number> {
  const snapshot = await getAdminDb().collection("vehicles").count().get();
  return snapshot.data().count;
}

export async function getRecentVehicles(max = 5): Promise<DashboardVehicle[]> {
  const snapshot = await getAdminDb()
    .collection("vehicles")
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      make: data.make ?? "",
      model: data.model ?? "",
      year: data.year ?? 0,
      priceUsd: data.priceUsd ?? 0,
      imageUrl: data.imageUrl,
      imagePath: data.imagePath,
      createdAt: toMillis(data.createdAt),
    };
  });
}

export async function getAllVehicles(): Promise<DashboardVehicle[]> {
  const snapshot = await getAdminDb().collection("vehicles").orderBy("createdAt", "desc").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      make: data.make ?? "",
      model: data.model ?? "",
      year: data.year ?? 0,
      priceUsd: data.priceUsd ?? 0,
      imageUrl: data.imageUrl,
      imagePath: data.imagePath,
      createdAt: toMillis(data.createdAt),
    };
  });
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
  const result = await getAdminAuth().listUsers(1000);
  return result.users.length;
}

export async function getAllUsers(): Promise<DashboardUser[]> {
  const result = await getAdminAuth().listUsers(1000);
  return result.users.map((user) => ({
    uid: user.uid,
    email: user.email ?? null,
    createdAt: user.metadata.creationTime ? Date.parse(user.metadata.creationTime) : null,
    lastSignInAt: user.metadata.lastSignInTime ? Date.parse(user.metadata.lastSignInTime) : null,
  }));
}
