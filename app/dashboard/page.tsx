import Image from "next/image";
import { Car, Mail, Users, TrendingUp, ImageOff } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import { formatPriceUsd } from "@/lib/format";
import {
  getContactCount,
  getMonthlyContactCount,
  getRecentContacts,
  getRecentVehicles,
  getUserCount,
  getVehicleCount,
} from "@/lib/dashboard-data";

export const metadata = {
  title: "Panel de Control — Aero Motors",
};

function formatDate(ms: number): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("es-UY", { dateStyle: "medium", timeStyle: "short" }).format(ms);
}

export default async function DashboardOverviewPage() {
  const [vehicleCount, contactCount, monthlyContacts, userCount, recentVehicles, recentContacts] =
    await Promise.all([
      getVehicleCount(),
      getContactCount(),
      getMonthlyContactCount(),
      getUserCount(),
      getRecentVehicles(5),
      getRecentContacts(5),
    ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-100">Panel de Control</h1>
      <p className="mt-1 text-sm text-ink-400">Resumen general de Aero Motors.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Car} label="Autos en inventario" value={String(vehicleCount)} />
        <KpiCard icon={Mail} label="Contactos activos" value={String(contactCount)} />
        <KpiCard icon={Users} label="Usuarios / admins" value={String(userCount)} />
        <KpiCard
          icon={TrendingUp}
          label="Consultas este mes"
          value={String(monthlyContacts)}
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-medium text-ink-100">Últimos autos en inventario</h2>
          <div className="mt-4 space-y-3">
            {recentVehicles.length === 0 && (
              <p className="rounded-2xl border border-hairline bg-obsidian-900 p-6 text-sm text-ink-400">
                Todavía no hay autos cargados. Agréguelos desde{" "}
                <span className="text-ink-100">Inventario de Autos</span>.
              </p>
            )}
            {recentVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center gap-4 rounded-2xl border border-hairline bg-obsidian-900 p-4"
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-obsidian-800">
                  {vehicle.imageUrl ? (
                    <Image
                      src={vehicle.imageUrl}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff size={18} className="text-ink-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-100">
                    {vehicle.make} {vehicle.model} · {vehicle.year}
                  </p>
                  <p className="font-mono text-sm text-ink-400">
                    {formatPriceUsd(vehicle.priceUsd)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-ink-100">Últimos contactos</h2>
          <div className="mt-4 space-y-3">
            {recentContacts.length === 0 && (
              <p className="rounded-2xl border border-hairline bg-obsidian-900 p-6 text-sm text-ink-400">
                Todavía no llegaron consultas desde el sitio.
              </p>
            )}
            {recentContacts.map((contact) => (
              <div key={contact.id} className="rounded-2xl border border-hairline bg-obsidian-900 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium text-ink-100">{contact.name}</p>
                  <span className="shrink-0 text-xs text-ink-600">
                    {formatDate(contact.createdAt)}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-ink-400">
                  {contact.email} · {contact.phone}
                </p>
                {contact.message && (
                  <p className="mt-2 line-clamp-2 text-sm text-ink-300">{contact.message}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
