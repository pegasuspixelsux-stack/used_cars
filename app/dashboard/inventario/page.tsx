import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import AddCarModal from "@/components/AddCarModal";
import DeleteCarButton from "@/components/DeleteCarButton";
import EditCarModal from "@/components/EditCarModal";
import { formatPriceUsd } from "@/lib/format";
import { getAllVehicles } from "@/lib/dashboard-data";

export const metadata = {
  title: "Inventario de Autos — Aero Motors",
};

const PAGE_SIZE = 10;

export default async function InventoryPage(props: PageProps<"/dashboard/inventario">) {
  const searchParams = await props.searchParams;
  const rawPage = searchParams.page;
  const requestedPage = Number(typeof rawPage === "string" ? rawPage : Array.isArray(rawPage) ? rawPage[0] : 1);

  const cars = await getAllVehicles();
  const totalPages = Math.max(1, Math.ceil(cars.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number.isFinite(requestedPage) ? requestedPage : 1), totalPages);
  const pageCars = cars.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
        {pageCars.map((car) => (
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
            <EditCarModal car={car} />
            <DeleteCarButton id={car.id} imagePaths={car.imagePaths} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-ink-600">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <PageLink page={currentPage - 1} disabled={currentPage <= 1} label="Anterior">
              <ChevronLeft size={15} />
              Anterior
            </PageLink>
            <PageLink page={currentPage + 1} disabled={currentPage >= totalPages} label="Siguiente">
              Siguiente
              <ChevronRight size={15} />
            </PageLink>
          </div>
        </div>
      )}
    </div>
  );
}

function PageLink({
  page,
  disabled,
  label,
  children,
}: {
  page: number;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-label={label}
        className="flex items-center gap-1.5 rounded-full border border-hairline px-4 py-2 text-sm text-ink-600 opacity-50"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={`/dashboard/inventario?page=${page}`}
      aria-label={label}
      className="flex items-center gap-1.5 rounded-full border border-hairline px-4 py-2 text-sm text-ink-300 transition-colors hover:border-hairline-strong hover:text-ink-100"
    >
      {children}
    </Link>
  );
}
