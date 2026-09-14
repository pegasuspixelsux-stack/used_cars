import Image from "next/image";
import Link from "next/link";
import { Gauge, Fuel, Cog } from "lucide-react";
import { formatMileage, formatPriceUsd } from "@/lib/format";
import type { PublicCar } from "@/lib/types";

const SPEC_ICONS = { mileage: Gauge, transmission: Cog, fuel: Fuel } as const;

export default function CarCard({ car }: { car: PublicCar }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-hairline bg-obsidian-900 transition-colors duration-300 hover:border-hairline-strong">
      <Link href={`/cars/${car.id}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={car.image}
          alt={`${car.make} ${car.model}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={60}
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        {car.featured && (
          <span className="absolute left-4 top-4 rounded-full border border-champagne-400/40 bg-obsidian-950/70 px-3 py-1 text-xs text-champagne-300 backdrop-blur-md">
            Destacado
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-lg font-medium tracking-tight text-ink-100">
            {car.make} {car.model}
          </h3>
          <span className="text-sm text-ink-400">{car.year}</span>
        </div>
        <p className="mt-1 text-sm text-ink-400">{car.color}</p>

        <p className="mt-4 font-mono text-2xl text-ink-100">{formatPriceUsd(car.price)}</p>

        <ul className="mt-5 flex flex-wrap gap-2">
          <li className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-xs text-ink-300">
            <SPEC_ICONS.mileage size={14} strokeWidth={1.75} className="text-champagne-400" />
            {formatMileage(car.mileage)}
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-xs text-ink-300">
            <SPEC_ICONS.transmission size={14} strokeWidth={1.75} className="text-champagne-400" />
            {car.transmission}
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-xs text-ink-300">
            <SPEC_ICONS.fuel size={14} strokeWidth={1.75} className="text-champagne-400" />
            {car.fuelType}
          </li>
        </ul>

        <Link
          href={`/cars/${car.id}`}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-hairline-strong py-2.5 text-sm font-medium text-ink-100 transition-colors duration-200 hover:bg-obsidian-800 active:scale-[0.97]"
        >
          Ver detalles
        </Link>
      </div>
    </article>
  );
}
