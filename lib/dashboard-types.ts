/**
 * Firestore document shapes for the admin dashboard that aren't cars —
 * the car shape itself is lib/types.ts's PublicCar, shared with the public
 * site since /dashboard/inventario manages the same `cars` collection.
 */

export interface ContactLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  vehicleOfInterest?: string;
  createdAt: number; // epoch ms
}

export interface DashboardUser {
  uid: string;
  email: string | null;
  createdAt: number | null; // epoch ms
  lastSignInAt: number | null; // epoch ms
}
