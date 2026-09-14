import Image from "next/image";
import { ImageOff } from "lucide-react";
import AddCarModal from "@/components/AddCarModal";
import DeleteCarButton from "@/components/DeleteCarButton";
import { formatPriceUsd } from "@/lib/format";
import { getAllVehicles } from "@/lib/dashboard-data";

export const metadata = {
  title: "Inventario de Autos — Aero Motors",
};

export default async function InventoryPage() {
  const cars = await getAllVehicles();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-100">Inventario de Autos</h1>
          <p className="mt-1 text-sm text-ink-400">
            {cars.length} {cars.length === 1 ? "auto cargado" : "autos cargados"} — visibles en el
            sitio público.
          </p>
        </div>
        <AddCarModal />
      </div>

      <div className="mt-8 space-y-3">
        {cars.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-obsidian-900 p-6 text-sm text-ink-400">
            Todavía no hay autos cargados.
          </p>
        )}
        {cars.map((car) => (
          <div
            key={car.id}
            className="flex items-center gap-4 rounded-2xl border border-hairline bg-obsidian-900 p-4"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-obsidian-800">
              {car.image ? (
                <Image
                  src={car.image}
                  alt={`${car.make} ${car.model}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageOff size={20} className="text-ink-600" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-100">
                {car.make} {car.model} · {car.year}
                {car.featured && <span className="ml-2 text-xs text-champagne-400">Destacado</span>}
              </p>
              <p className="font-mono text-sm text-ink-400">{formatPriceUsd(car.price)}</p>
            </div>
            <DeleteCarButton id={car.id} imagePaths={car.imagePaths} />
          </div>
        ))}
      </div>
    </div>
  );
}
