"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, BadgeCheck, Truck, FileCheck } from "lucide-react";
import { formatPriceUsd } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

const BADGES = [
  { icon: ShieldCheck, label: "Historial verificado" },
  { icon: BadgeCheck, label: "Precio transparente" },
  { icon: Truck, label: "Entrega a domicilio" },
  { icon: FileCheck, label: "Garantía incluida" },
];

export default function Hero({ vehicle }: { vehicle: Vehicle }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[36rem] w-[36rem] rounded-full bg-champagne-400/10 blur-[120px]"
      />

      <div className="mx-auto grid max-w-[1400px] gap-16 px-6 sm:px-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:px-16">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.02em] text-ink-100 sm:text-6xl lg:text-[4rem]">
            Autos excepcionales,
            <br />a su medida.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-400">
            En Aero Motors seleccionamos y certificamos vehículos premium
            usados para Punta del Este y el resto del país: cada auto pasa
            por una inspección independiente y cada precio se muestra
            completo, sin que usted tenga que preguntar.
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
              className="inline-flex items-center rounded-full border border-hairline-strong px-6 py-3.5 text-[0.9375rem] font-medium text-ink-100 transition-colors duration-200 hover:bg-obsidian-800 active:scale-[0.97]"
            >
              Coordinar una consulta
            </a>
          </div>

          <motion.ul
            initial={shouldReduceMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4"
          >
            {BADGES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5">
                <Icon size={18} className="shrink-0 text-champagne-400" strokeWidth={1.75} />
                <span className="text-sm text-ink-400">{label}</span>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", bounce: 0.18, duration: 0.9, delay: 0.15 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[1.75rem] border border-hairline bg-obsidian-900 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src={vehicle.image.src}
                alt={vehicle.image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
                preload
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/70 via-transparent to-transparent" />
            </div>

            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl border border-hairline bg-obsidian-950/60 px-5 py-4 backdrop-blur-md">
              <div>
                <p className="text-sm text-ink-400">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
                <p className="mt-0.5 font-mono text-lg text-ink-100">
                  {formatPriceUsd(vehicle.priceUsd)}
                </p>
              </div>
              <span className="rounded-full border border-champagne-400/40 px-3 py-1 text-xs text-champagne-300">
                Destacado
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
