import Hero from "@/components/Hero";
import Inventory from "@/components/Inventory";
import Advantages from "@/components/Advantages";
import InteractiveTools from "@/components/InteractiveTools";
import ContactSection from "@/components/ContactSection";
import { featuredVehicle, inventory } from "@/lib/vehicles";

export default function Home() {
  return (
    <>
      <Hero vehicle={featuredVehicle} />
      <Inventory vehicles={inventory} />
      <Advantages />
      <InteractiveTools />
      <ContactSection />
    </>
  );
}
