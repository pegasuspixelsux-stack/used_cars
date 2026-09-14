"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Search } from "lucide-react";
import CarCard from "./CarCard";
import Pagination from "./Pagination";
import PillToggle from "./PillToggle";
import { cn } from "@/lib/format";
import type { FuelType, PublicCar, Transmission } from "@/lib/types";

const PAGE_SIZE = 12;
const ALL = "all";

const TRANSMISSIONS: Transmission[] = ["Manual", "Automática"];

type Filters = {
  query: string;
  make: string;
  model: string;
  minPrice: string;
  maxPrice: string;
  transmission: Transmission | typeof ALL;
  fuelType: FuelType | typeof ALL;
  minYear: string;
  maxYear: string;
};

const EMPTY_FILTERS: Filters = {
  query: "",
  make: ALL,
  model: ALL,
  minPrice: "",
  maxPrice: "",
  transmission: ALL,
  fuelType: ALL,
  minYear: "",
  maxYear: "",
};

const inputClass =
  "w-full rounded-xl border border-hairline bg-obsidian-950 px-3.5 py-2.5 text-sm text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400";
const selectClass =
  "w-full appearance-none rounded-xl border border-hairline bg-obsidian-950 px-3.5 py-2.5 text-sm text-ink-100 outline-none transition-colors focus:border-champagne-400";

export default function InventoryBrowser({ cars }: { cars: PublicCar[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const makes = useMemo(() => Array.from(new Set(cars.map((car) => car.make))).sort(), [cars]);
  const fuelTypes = useMemo(
    () => Array.from(new Set(cars.map((car) => car.fuelType))).sort(),
    [cars],
  );
  const models = useMemo(() => {
    const pool = filters.make === ALL ? cars : cars.filter((car) => car.make === filters.make);
    return Array.from(new Set(pool.map((car) => car.model))).sort();
  }, [cars, filters.make]);

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const minPrice = filters.minPrice ? Number(filters.minPrice) : undefined;
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : undefined;
    const minYear = filters.minYear ? Number(filters.minYear) : undefined;
    const maxYear = filters.maxYear ? Number(filters.maxYear) : undefined;

    return cars.filter((car) => {
      if (query && !`${car.make} ${car.model} ${car.year}`.toLowerCase().includes(query)) {
        return false;
      }
      if (filters.make !== ALL && car.make !== filters.make) return false;
      if (filters.model !== ALL && car.model !== filters.model) return false;
      if (filters.transmission !== ALL && car.transmission !== filters.transmission) return false;
      if (filters.fuelType !== ALL && car.fuelType !== filters.fuelType) return false;
      if (minPrice !== undefined && car.price < minPrice) return false;
      if (maxPrice !== undefined && car.price > maxPrice) return false;
      if (minYear !== undefined && car.year < minYear) return false;
      if (maxYear !== undefined && car.year > maxYear) return false;
      return true;
    });
  }, [cars, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageCars = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function patchFilters(patch: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value !== EMPTY_FILTERS[key as keyof Filters],
  );

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr] lg:gap-12">
      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-100">Filtros</h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => patchFilters(EMPTY_FILTERS)}
              className="inline-flex items-center gap-1.5 text-xs text-ink-400 transition-colors hover:text-ink-100"
            >
              <RotateCcw size={12} />
              Limpiar
            </button>
          )}
        </div>

        <div className="mt-5 space-y-6">
          <div>
            <label htmlFor="inventory-query" className="mb-2 block text-xs text-ink-400">
              Buscar
            </label>
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-600"
              />
              <input
                id="inventory-query"
                type="text"
                value={filters.query}
                onChange={(event) => patchFilters({ query: event.target.value })}
                placeholder="Marca, modelo…"
                className={cn(inputClass, "pl-9")}
              />
            </div>
          </div>

          <div>
            <label htmlFor="inventory-make" className="mb-2 block text-xs text-ink-400">
              Marca
            </label>
            <select
              id="inventory-make"
              value={filters.make}
              onChange={(event) => patchFilters({ make: event.target.value, model: ALL })}
              className={selectClass}
            >
              <option value={ALL}>Todas las marcas</option>
              {makes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="inventory-model" className="mb-2 block text-xs text-ink-400">
              Modelo
            </label>
            <select
              id="inventory-model"
              value={filters.model}
              onChange={(event) => patchFilters({ model: event.target.value })}
              className={selectClass}
            >
              <option value={ALL}>Todos los modelos</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-2 text-xs text-ink-400">Precio (US$)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={filters.minPrice}
                onChange={(event) => patchFilters({ minPrice: event.target.value })}
                placeholder="Mínimo"
                aria-label="Precio mínimo"
                className={inputClass}
              />
              <span className="text-ink-600">–</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={filters.maxPrice}
                onChange={(event) => patchFilters({ maxPrice: event.target.value })}
                placeholder="Máximo"
                aria-label="Precio máximo"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-ink-400">Año</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={1990}
                value={filters.minYear}
                onChange={(event) => patchFilters({ minYear: event.target.value })}
                placeholder="Desde"
                aria-label="Año mínimo"
                className={inputClass}
              />
              <span className="text-ink-600">–</span>
              <input
                type="number"
                inputMode="numeric"
                min={1990}
                value={filters.maxYear}
                onChange={(event) => patchFilters({ maxYear: event.target.value })}
                placeholder="Hasta"
                aria-label="Año máximo"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-ink-400">Transmisión</p>
            <div className="flex flex-wrap gap-2">
              <PillToggle
                label="Todas"
                active={filters.transmission === ALL}
                onClick={() => patchFilters({ transmission: ALL })}
              />
              {TRANSMISSIONS.map((option) => (
                <PillToggle
                  key={option}
                  label={option}
                  active={filters.transmission === option}
                  onClick={() => patchFilters({ transmission: option })}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-ink-400">Combustible</p>
            <div className="flex flex-wrap gap-2">
              <PillToggle
                label="Todos"
                active={filters.fuelType === ALL}
                onClick={() => patchFilters({ fuelType: ALL })}
              />
              {fuelTypes.map((option) => (
                <PillToggle
                  key={option}
                  label={option}
                  active={filters.fuelType === option}
                  onClick={() => patchFilters({ fuelType: option })}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div>
        <p className="text-sm text-ink-400">
          {filtered.length} {filtered.length === 1 ? "auto encontrado" : "autos encontrados"}
        </p>

        <AnimatePresence mode="wait">
          {pageCars.length > 0 ? (
            <motion.ul
              key={`${safePage}-${filters.query}-${filters.make}-${filters.model}-${filters.minPrice}-${filters.maxPrice}-${filters.transmission}-${filters.fuelType}-${filters.minYear}-${filters.maxYear}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {pageCars.map((car) => (
                <li key={car.id}>
                  <CarCard car={car} />
                </li>
              ))}
            </motion.ul>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-5 rounded-3xl border border-hairline bg-obsidian-900 p-10 text-center text-ink-400"
            >
              No encontramos autos con esos filtros. Probá ajustando el precio,
              el año o el modelo.
            </motion.p>
          )}
        </AnimatePresence>

        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
