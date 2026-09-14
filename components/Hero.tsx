"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { FileCheck, KeyRound, ShieldCheck, BadgeCheck } from "lucide-react";
import type { Vehicle } from "@/lib/types";

const STATS = [
  { icon: FileCheck, label: "Registro local incluido" },
  { icon: KeyRound, label: "Test drive inmediato" },
  { icon: ShieldCheck, label: "Inspección mecánica completa" },
  { icon: BadgeCheck, label: "Precio transparente" },
];

export default function Hero({ vehicle }: { vehicle: Vehicle }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[88vh] w-full items-center overflow-hidden bg-obsidian-950">
      <div className="absolute inset-0">
        <Image
          src={vehicle.image.src}
          alt={vehicle.image.alt}
          fill
          sizes="100vw"
          className="object-cover object-center"
          preload
        />
      </div>

      {/* Multi-stop overlay: strong from the left where the copy sits, fading toward the image on the right. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-obsidian-950/9 via-obsidian-950/7 to-obsidian-950/1"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-obsidian-950/8 via-transparent to-obsidian-950/2"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-6xl sm:leading-[1.05] lg:text-[4rem]">
            Autos certificados,
            <br />
            listos para conducir.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
            Precio transparente, inspección mecánica completa y la
            confianza de un concesionario que conoce el mercado local.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#inventory"
              className="inline-flex items-center rounded-full bg-champagne-400 px-6 py-3.5 text-[0.9375rem] font-medium text-black transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.97]"
            >
              Ver inventario
            </a>
            <a
              href="#contact"
              className="inline-flex items-center rounded-full border border-white/30 px-6 py-3.5 text-[0.9375rem] font-medium text-white transition-colors duration-200 hover:bg-white/10 active:scale-[0.97]"
            >
              Solicitar cotización
            </a>
          </div>
        </motion.div>

        <motion.ul
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 grid grid-cols-2 gap-3 sm:mt-20 sm:flex sm:flex-wrap sm:gap-4"
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
    </section>
  );
}
