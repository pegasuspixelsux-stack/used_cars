"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/format";
import type { PublicCar } from "@/lib/types";

const ALL = "";
const selectClass =
  "w-full appearance-none rounded-xl border border-hairline bg-obsidian-950 px-3.5 py-2.5 text-sm font-medium text-ink-100 outline-none transition-colors focus:border-champagne-400";

/**
 * Floating search card straddling the hero/content boundary on desktop
 * (lg:-translate-y-1/4 pulls it up only part way, sitting mostly in the
 * section below rather than deep into the hero) — rendered right after
 * <Hero /> in app/(marketing)/page.tsx. Below lg it's a collapsible
 * accordion, closed by default.
 *
 * `open` always starts false, identically on server and client — no
 * viewport-dependent guess that could differ after hydration (that's the
 * same class of flash bug fixed in Hero.tsx). Desktop instead gets an
 * unconditional `lg:!grid` override that forces the form visible
 * regardless of `open`, so the mobile-closed default never affects lg+.
 *
 * Submitting routes to /inventory with the picked year/make/model as
 * query params, which app/(marketing)/inventory/page.tsx reads to seed
 * InventoryBrowser's initial filters.
 */
export default function HeroFilterBar({ cars }: { cars: PublicCar[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(ALL);
  const [make, setMake] = useState(ALL);
  const [model, setModel] = useState(ALL);

  const years = useMemo(
    () => Array.from(new Set(cars.map((car) => car.year))).sort((a, b) => b - a),
    [cars],
  );
  const makes = useMemo(() => Array.from(new Set(cars.map((car) => car.make))).sort(), [cars]);
  const models = useMemo(() => {
    const pool = make === ALL ? cars : cars.filter((car) => car.make === make);
    return Array.from(new Set(pool.map((car) => car.model))).sort();
  }, [cars, make]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    router.push(params.size ? `/inventory?${params}` : "/inventory");
  }

  return (
    <div className="relative z-20 mx-auto w-full max-w-7xl -translate-y-[20%] px-4 sm:px-6 lg:px-8 lg:-translate-y-1/4">
      <div className="rounded-2xl border border-hairline bg-obsidian-900/90 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-2 p-4 text-sm font-medium text-ink-100 lg:hidden"
        >
          <span className="flex items-center gap-2">
            <Search size={16} className="text-champagne-400" />
            Buscar por año, marca o modelo
          </span>
          <ChevronDown
            size={16}
            className={cn("text-ink-400 transition-transform duration-200", open && "rotate-180")}
          />
        </button>

        <form
          onSubmit={handleSearch}
          className={cn(
            "grid-cols-1 gap-3 p-4 pt-0 sm:grid-cols-4 lg:!grid lg:gap-4 lg:p-5",
            open ? "grid" : "hidden",
          )}
        >
          <div className="flex flex-col">
            <label htmlFor="hero-filter-year" className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-400">
              Año
            </label>
            <select
              id="hero-filter-year"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className={selectClass}
            >
              <option value={ALL}>Todos los años</option>
              {years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="hero-filter-make" className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-400">
              Marca
            </label>
            <select
              id="hero-filter-make"
              value={make}
              onChange={(event) => {
                setMake(event.target.value);
                setModel(ALL);
              }}
              className={selectClass}
            >
              <option value={ALL}>Todas las marcas</option>
              {makes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="hero-filter-model" className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-400">
              Modelo
            </label>
            <select
              id="hero-filter-model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className={selectClass}
            >
              <option value={ALL}>Todos los modelos</option>
              {models.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-champagne-400 px-5 py-2.5 text-sm font-semibold text-black shadow-md transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.98]"
            >
              <Search size={15} />
              Buscar inventario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
