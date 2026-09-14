import Hero from "@/components/Hero";
import Inventory from "@/components/Inventory";
import Advantages from "@/components/Advantages";
import InteractiveTools from "@/components/InteractiveTools";
import ContactSection from "@/components/ContactSection";
import { getPublicInventory } from "@/lib/public-inventory";
import { getSiteSettings } from "@/lib/site-settings";

// Real inventory lives in Firestore and can change any time (dashboard,
// seed script, or the Firebase console) — revalidate the homepage
// periodically instead of baking the list in at build time forever.
export const revalidate = 60;

const FALLBACK_HERO_IMAGE =
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1920";

export default async function Home() {
  const [cars, settings] = await Promise.all([getPublicInventory(), getSiteSettings()]);
  const heroCar = cars.find((car) => car.featured) ?? cars[0];
  // Prefer the admin-uploaded hero images (app/dashboard/settings/page.tsx,
  // one per theme) over a car photo, so the homepage's look isn't tied to
  // the inventory.
  const heroImageLight = settings.heroImageLight || heroCar?.image || FALLBACK_HERO_IMAGE;
  const heroImageDark = settings.heroImageDark || heroCar?.image || FALLBACK_HERO_IMAGE;
  const heroAlt =
    settings.heroImageLight || settings.heroImageDark
      ? `${settings.logoText} — vehículo destacado`
      : heroCar
        ? `${heroCar.make} ${heroCar.model}`
        : "Auto disponible en Aero Motors";

  return (
    <>
      <Hero imageLight={heroImageLight} imageDark={heroImageDark} imageAlt={heroAlt} />
      <Inventory cars={cars.slice(0, 6)} />
      <Advantages />
      <InteractiveTools />
      <ContactSection imageLight={settings.contactImageLight} imageDark={settings.contactImageDark} />
    </>
  );
}
