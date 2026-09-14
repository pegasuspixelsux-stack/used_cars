import { ArrowUpRight } from "lucide-react";
import CarGrid from "./CarGrid";
import type { Vehicle } from "@/lib/types";

export default function Inventory({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <section id="inventory" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-ink-100 sm:text-4xl">
              Modelos populares
            </h2>
            <p className="mt-3 max-w-md text-ink-400">
              Una selección rotativa del inventario disponible actualmente
              para inspeccionar en Punta del Este.
            </p>
          </div>
          <a
            href="#contact"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-champagne-400"
          >
            Ver todo el inventario
            <ArrowUpRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>

        <div className="mt-12">
          <CarGrid vehicles={vehicles} />
        </div>
      </div>
    </section>
  );
}
