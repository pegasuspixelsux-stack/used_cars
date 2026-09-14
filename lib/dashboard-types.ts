/**
 * Firestore document shapes for the admin dashboard. Kept separate from
 * lib/types.ts (the public marketing site's static Vehicle type) since the
 * dashboard manages its own Firestore-backed inventory — the two aren't
 * wired together yet. See DASHBOARD_SETUP.md.
 */

export interface DashboardVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  priceUsd: number;
  imageUrl?: string;
  imagePath?: string;
  createdAt: number; // epoch ms
}

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
