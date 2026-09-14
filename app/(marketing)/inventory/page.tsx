import InventoryBrowser from "@/components/InventoryBrowser";
import { getPublicInventory } from "@/lib/public-inventory";

export const metadata = {
  title: "Inventario — Aero Motors",
  description:
    "Explorá todo el inventario de autos usados disponible en Aero Motors, Punta del Este. Filtrá por marca, modelo, precio, año, transmisión y combustible.",
};

export const revalidate = 60;

export default async function InventoryPage(props: PageProps<"/inventory">) {
  const searchParams = await props.searchParams;
  const cars = await getPublicInventory();

  // Seeded by components/HeroFilterBar.tsx's search, which routes here with
  // these as query params.
  const param = (key: string) => {
    const value = searchParams[key];
    return typeof value === "string" && value ? value : undefined;
  };
  const initialFilters = {
    year: param("year"),
    make: param("make"),
    model: param("model"),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-12 sm:px-6 sm:pt-32 sm:pb-16 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-100 sm:text-4xl">
          Inventario completo
        </h1>
        <p className="mt-3 max-w-xl text-ink-400">
          Todos los autos usados disponibles en Aero Motors, Punta del Este.
          Filtrá por lo que más te importa.
        </p>
      </div>

      {cars.length > 0 ? (
        <InventoryBrowser cars={cars} initialFilters={initialFilters} />
      ) : (
        <p className="rounded-3xl border border-hairline bg-obsidian-900 p-10 text-center text-ink-400">
          Estamos actualizando el inventario. Escríbanos y le avisamos en
          cuanto haya autos disponibles.
        </p>
      )}
    </div>
  );
}
