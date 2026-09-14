import "server-only";
import { cache } from "react";
import { getAdminDb } from "@/lib/firebase-admin";
import type { SiteSettings } from "@/lib/types";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logoText: "AERO MOTORS",
  whatsappNumber: "59899123456",
  phone: "+598 4249 1122",
  address: "Ruta 10, Km 161, Punta del Este, Uruguay",
  hours: "Lunes a Viernes de 9:00 a 19:00 hs",
  heroImageLight: "",
  heroImageDark: "",
  heroImageLightPath: "",
  heroImageDarkPath: "",
  contactImageLight: "",
  contactImageDark: "",
  contactImageLightPath: "",
  contactImageDarkPath: "",
  showHeroSearch: true,
};

/**
 * Dealership-wide settings, read from Firestore's `settings/general` doc
 * (written by app/dashboard/settings/page.tsx). Both the marketing layout
 * and the homepage need this in the same request — wrapped in React's
 * cache() so they share one Firestore read instead of two.
 *
 * Wrapped in try/catch rather than letting it throw: this runs during
 * `next build`'s prerender too, and a page that can't reach Firestore
 * should fall back to the hardcoded defaults, not fail the whole build.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const doc = await getAdminDb().collection("settings").doc("general").get();
    if (!doc.exists) return DEFAULT_SITE_SETTINGS;
    const data = doc.data() ?? {};
    return {
      logoText: (data.logoText as string) || DEFAULT_SITE_SETTINGS.logoText,
      whatsappNumber: (data.whatsappNumber as string) || DEFAULT_SITE_SETTINGS.whatsappNumber,
      phone: (data.phone as string) || DEFAULT_SITE_SETTINGS.phone,
      address: (data.address as string) || DEFAULT_SITE_SETTINGS.address,
      hours: (data.hours as string) || DEFAULT_SITE_SETTINGS.hours,
      heroImageLight: (data.heroImageLight as string) || "",
      heroImageDark: (data.heroImageDark as string) || "",
      heroImageLightPath: (data.heroImageLightPath as string) || "",
      heroImageDarkPath: (data.heroImageDarkPath as string) || "",
      contactImageLight: (data.contactImageLight as string) || "",
      contactImageDark: (data.contactImageDark as string) || "",
      contactImageLightPath: (data.contactImageLightPath as string) || "",
      contactImageDarkPath: (data.contactImageDarkPath as string) || "",
      showHeroSearch:
        typeof data.showHeroSearch === "boolean" ? data.showHeroSearch : DEFAULT_SITE_SETTINGS.showHeroSearch,
    };
  } catch (error) {
    console.error("getSiteSettings: could not read Firestore, using defaults", error);
    return DEFAULT_SITE_SETTINGS;
  }
});
