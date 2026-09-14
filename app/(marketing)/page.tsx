import Hero from "@/components/Hero";
import Inventory from "@/components/Inventory";
import Advantages from "@/components/Advantages";
import InteractiveTools from "@/components/InteractiveTools";
import ContactSection from "@/components/ContactSection";
import { getPublicInventory } from "@/lib/public-inventory";

// Real inventory lives in Firestore and can change any time (dashboard,
// seed script, or the Firebase console) — revalidate the homepage
// periodically instead of baking the list in at build time forever.
export const revalidate = 60;

const FALLBACK_HERO_IMAGE =
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1920";

export default async function Home() {
  const cars = await getPublicInventory();
  const heroCar = cars.find((car) => car.featured) ?? cars[0];

  return (
    <>
      <Hero
        imageSrc={heroCar?.image ?? FALLBACK_HERO_IMAGE}
        imageAlt={heroCar ? `${heroCar.make} ${heroCar.model}` : "Auto disponible en Aero Motors"}
      />
      <Inventory cars={cars} />
      <Advantages />
      <InteractiveTools />
      <ContactSection />
    </>
  );
}
