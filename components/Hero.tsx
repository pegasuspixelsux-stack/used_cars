"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { FileCheck, KeyRound } from "lucide-react";
import WhatsAppLeadModal from "./WhatsAppLeadModal";

const STATS = [
  { icon: FileCheck, label: "Registro local incluido" },
  { icon: KeyRound, label: "Test drive inmediato" },
];

interface HeroProps {
  /** Background per theme — set in app/dashboard/settings/page.tsx. */
  imageLight: string;
  imageDark: string;
  imageAlt: string;
  whatsappNumber: string;
}

export default function Hero({ imageLight, imageDark, imageAlt, whatsappNumber }: HeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration guard
  useEffect(() => setMounted(true), []);
  // Theme resolves client-side only (next-themes) — default to the dark
  // image before mount, matching this site's default theme, same guard
  // Navbar.tsx uses for its own theme-dependent styling.
  const isLight = mounted && resolvedTheme === "light";
  const imageSrc = (isLight ? imageLight : imageDark) || imageDark || imageLight;

  return (
    <section className="relative flex min-h-[88vh] w-full items-end overflow-hidden bg-obsidian-950 sm:items-center">
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="object-cover object-center"
          preload
        />
      </div>

      {/* Multi-stop overlay: strong from the left where the copy sits, fading toward the image on the right.
          Stronger on mobile (text sits bottom-aligned there, needs more contrast) — back to the original
          subtle version at sm and up. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-obsidian-950/80 via-obsidian-950/50 to-obsidian-950/12 sm:from-obsidian-950/9 sm:via-obsidian-950/7 sm:to-obsidian-950/1"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-obsidian-950/21 sm:from-obsidian-950/8 sm:to-obsidian-950/2"
      />

      <div className="relative mx-auto w-full max-w-7xl translate-y-[5%] px-4 pt-32 pb-16 sm:translate-y-0 sm:px-6 sm:pt-36 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-overlay-text sm:text-6xl sm:leading-[1.05] lg:text-[4rem]">
            Autos certificados,
            <br />
            listos para conducir.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-overlay-text/80">
            Precio transparente, inspección mecánica completa y la
            confianza de un concesionario que conoce el mercado local.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <a
              href="#inventory"
              className="flex w-full items-center justify-center rounded-full bg-champagne-400 px-6 py-3.5 text-[0.9375rem] font-medium text-black transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.97] sm:inline-flex sm:w-auto"
            >
              Ver inventario
            </a>
            <button
              type="button"
              onClick={() => setLeadModalOpen(true)}
              className="flex w-full items-center justify-center rounded-full border border-overlay-text/30 px-6 py-3.5 text-[0.9375rem] font-medium text-overlay-text transition-colors duration-200 hover:bg-overlay-text/10 active:scale-[0.97] sm:inline-flex sm:w-auto"
            >
              Solicitar cotización
            </button>
          </div>
        </motion.div>

        <motion.ul
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="hidden gap-3 sm:mt-10 sm:flex sm:flex-wrap sm:gap-4"
        >
          {STATS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2.5 rounded-2xl border border-hairline bg-obsidian-950/40 px-4 py-3 backdrop-blur-md sm:px-5"
            >
              <Icon size={18} className="shrink-0 text-champagne-400" strokeWidth={1.75} />
              <span className="text-sm text-ink-100">{label}</span>
            </li>
          ))}
        </motion.ul>
      </div>

      <WhatsAppLeadModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        whatsappNumber={whatsappNumber}
      />
    </section>
  );
}
