import Image from "next/image";
import { ImageOff } from "lucide-react";
import AddVehicleForm from "@/components/AddVehicleForm";
import DeleteVehicleButton from "@/components/DeleteVehicleButton";
import { formatPriceUsd } from "@/lib/format";
import { getAllVehicles } from "@/lib/dashboard-data";

export const metadata = {
  title: "Inventario de Autos — Aero Motors",
};

export default async function InventoryPage() {
  const vehicles = await getAllVehicles();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-100">Inventario de Autos</h1>
      <p className="mt-1 text-sm text-ink-400">
        {vehicles.length} {vehicles.length === 1 ? "auto cargado" : "autos cargados"} en Firestore.
      </p>

      <div className="mt-8">
        <AddVehicleForm />
      </div>

      <div className="mt-8 space-y-3">
        {vehicles.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-obsidian-900 p-6 text-sm text-ink-400">
            Todavía no hay autos cargados.
          </p>
        )}
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex items-center gap-4 rounded-2xl border border-hairline bg-obsidian-900 p-4"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-obsidian-800">
              {vehicle.imageUrl ? (
                <Image
                  src={vehicle.imageUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
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
                {vehicle.make} {vehicle.model} · {vehicle.year}
              </p>
              <p className="font-mono text-sm text-ink-400">{formatPriceUsd(vehicle.priceUsd)}</p>
            </div>
            <DeleteVehicleButton id={vehicle.id} imagePath={vehicle.imagePath} />
          </div>
        ))}
      </div>
    </div>
  );
}
