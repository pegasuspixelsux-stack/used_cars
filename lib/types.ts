/**
 * Canonical shape for a public listing, sourced live from Firestore's
 * `cars` collection (see scripts/seedCars.mts and lib/public-inventory.ts).
 * Replaces the old static mock (formerly lib/vehicles.ts).
 */
export type Transmission = "Automática" | "Manual";
export type FuelType = "Nafta" | "Diesel" | "Híbrido" | "Eléctrico";

export interface PublicCar {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: Transmission;
  fuelType: FuelType;
  color: string;
  /** Cover photo — images[0] when present, kept for cards that only need one shot. */
  image: string;
  /** Full photo set. Optional: docs from scripts/seedCars.mts only ever set `image`. */
  images?: string[];
  /** Storage paths matching `images`, needed to delete the files on removal. */
  imagePaths?: string[];
  featured: boolean;
  features?: string[];
  description?: string;
}
