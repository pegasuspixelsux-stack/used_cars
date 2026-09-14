import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/site-settings";

/**
 * Public marketing chrome (nav + footer). Scoped to this route group so
 * /login and /dashboard render standalone, without the site's nav/footer.
 */
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar logoText={settings.logoText} whatsappNumber={settings.whatsappNumber} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
