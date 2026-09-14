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

/**
 * Dealership-wide branding/contact/hours, edited from
 * app/dashboard/settings/page.tsx and stored at Firestore's
 * `settings/general` doc. Read by the public site (Navbar, Footer, Hero)
 * so those details can change without a code deploy.
 */
export interface SiteSettings {
  /** Single free-text brand name (e.g. "AERO MOTORS") — split on the first
   *  space for the two-tone logo treatment; see lib/format.ts#splitLogoText. */
  logoText: string;
  /** Digits only, no "+" or spaces — ready to drop into a wa.me link. */
  whatsappNumber: string;
  phone: string;
  address: string;
  hours: string;
  /** Storage download URLs for the homepage hero background, one per theme
   *  — components/Hero.tsx switches between them based on the resolved
   *  theme. Empty until the admin uploads one; the homepage falls back to
   *  a featured car's photo, then a stock image, independently per theme. */
  heroImageLight: string;
  heroImageDark: string;
  /** Storage paths matching the two URLs above, needed to delete the old
   *  file when it's replaced. */
  heroImageLightPath: string;
  heroImageDarkPath: string;
  /** Same pattern as the hero images above, for the contact section's
   *  background photo (components/ContactSection.tsx). Empty until the
   *  admin uploads one; falls back to a stock image. */
  contactImageLight: string;
  contactImageDark: string;
  contactImageLightPath: string;
  contactImageDarkPath: string;
  /** Toggles components/HeroFilterBar.tsx (the year/make/model search card
   *  floating over the hero's bottom edge) on the homepage. */
  showHeroSearch: boolean;
}
