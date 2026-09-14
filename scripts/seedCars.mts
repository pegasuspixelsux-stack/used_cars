/**
 * One-off Firestore seeder for the local 10-car inventory.
 *
 * Standalone script (not part of the Next.js app) — it initializes its own
 * Admin SDK instance rather than importing lib/firebase-admin.ts, since that
 * file carries Next-specific assumptions ("server-only", "@/" path aliases)
 * that don't apply when running under plain Node.
 *
 * Usage (env vars aren't auto-loaded outside Next.js — pass them explicitly):
 *   node --env-file=.env.local scripts/seedCars.mts
 *   npm run seed:cars
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const COLLECTION = "cars";

interface SeedCar {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: "Manual" | "Automática";
  fuelType: "Nafta" | "Diesel";
  color: string;
  image: string;
  featured: boolean;
}

// Every image URL below was verified live (200) before being committed here —
// one of the URLs originally drafted for this list 404'd and was swapped out.
const initialInventory: SeedCar[] = [
  {
    make: "Chevrolet",
    model: "Onix 1.4 LTZ",
    year: 2019,
    price: 14500,
    mileage: 68000,
    transmission: "Manual",
    fuelType: "Nafta",
    color: "Blanco Plata",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    make: "Volkswagen",
    model: "Gol Trend 1.6",
    year: 2021,
    price: 13900,
    mileage: 45000,
    transmission: "Manual",
    fuelType: "Nafta",
    color: "Gris Plomo",
    image: "https://images.unsplash.com/photo-1777284748744-7086291d4abe?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    make: "Renault",
    model: "Sandero Stepway 1.6",
    year: 2020,
    price: 15800,
    mileage: 54000,
    transmission: "Manual",
    fuelType: "Nafta",
    color: "Rojo Fuego",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    make: "Peugeot",
    model: "208 Allure 1.6",
    year: 2022,
    price: 18500,
    mileage: 32000,
    transmission: "Automática",
    fuelType: "Nafta",
    color: "Azul Perla",
    image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    make: "Fiat",
    model: "Cronos Precision 1.8",
    year: 2021,
    price: 16200,
    mileage: 49000,
    transmission: "Automática",
    fuelType: "Nafta",
    color: "Blanco Perlado",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    make: "Toyota",
    model: "Hilux DX 2.4 TDI",
    year: 2018,
    price: 28500,
    mileage: 95000,
    transmission: "Manual",
    fuelType: "Diesel",
    color: "Blanco",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    make: "Chevrolet",
    model: "Tracker LTZ 1.2 Turbo",
    year: 2022,
    price: 22000,
    mileage: 28000,
    transmission: "Automática",
    fuelType: "Nafta",
    color: "Negro Metálico",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    make: "Nissan",
    model: "Versa Exclusive 1.6",
    year: 2021,
    price: 17500,
    mileage: 41000,
    transmission: "Automática",
    fuelType: "Nafta",
    color: "Gris Oscuro",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    make: "Volkswagen",
    model: "Saveiro Cross 1.6",
    year: 2019,
    price: 15000,
    mileage: 72000,
    transmission: "Manual",
    fuelType: "Nafta",
    color: "Plata Sirio",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    make: "Ford",
    model: "Ranger XLS 2.2 Diesel",
    year: 2020,
    price: 29900,
    mileage: 81000,
    transmission: "Manual",
    fuelType: "Diesel",
    color: "Azul Metálico",
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
];

function readEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Run this script with the Admin SDK env vars loaded, e.g.:\n` +
        `  node --env-file=.env.local scripts/seedCars.mts`,
    );
  }
  return value;
}

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: readEnv("FIREBASE_ADMIN_PROJECT_ID"),
        clientEmail: readEnv("FIREBASE_ADMIN_CLIENT_EMAIL"),
        privateKey: readEnv("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}

export async function seedDatabase(): Promise<void> {
  const db = getAdminDb();
  const carsCollection = db.collection(COLLECTION);

  const existing = await carsCollection.limit(1).get();
  if (!existing.empty) {
    console.log(`"${COLLECTION}" already has data — skipping seed. Delete the collection first if you want to re-seed.`);
    return;
  }

  const batch = db.batch();
  const now = Timestamp.now();
  for (const car of initialInventory) {
    const ref = carsCollection.doc();
    batch.set(ref, { ...car, createdAt: now });
  }
  await batch.commit();

  console.log(`Seeded ${initialInventory.length} cars into "${COLLECTION}".`);
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
