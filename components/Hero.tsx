"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Users, BadgeCheck, Truck, ShieldCheck } from "lucide-react";
import type { Vehicle } from "@/lib/types";

const STATS = [
  { icon: Users, label: "+500 clientes" },
  { icon: BadgeCheck, label: "100% transparente" },
  { icon: Truck, label: "Entrega en 20–30 días" },
  { icon: ShieldCheck, label: "3 años de garantía" },
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
        className="absolute inset-0 bg-gradient-to-r from-obsidian-950/90 via-obsidian-950/65 to-obsidian-950/10"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-obsidian-950/20"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl"
        >
          <h1 className="text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.02em] text-ink-100 sm:text-6xl lg:text-[4rem]">
            Vehículos premium,
            <br />
            importados a su pedido.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-300">
            Precio transparente, acompañamiento de punta a punta y garantía
            en cada vehículo que llega a sus manos.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#inventory"
              className="inline-flex items-center rounded-full bg-champagne-400 px-6 py-3.5 text-[0.9375rem] font-medium text-obsidian-950 transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.97]"
            >
              Ver inventario
            </a>
            <a
              href="#contact"
              className="inline-flex items-center rounded-full border border-ink-100/30 px-6 py-3.5 text-[0.9375rem] font-medium text-ink-100 transition-colors duration-200 hover:bg-obsidian-950/40 active:scale-[0.97]"
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
