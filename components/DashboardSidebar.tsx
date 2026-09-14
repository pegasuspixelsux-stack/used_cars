"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Users, Mail, Settings } from "lucide-react";
import { cn } from "@/lib/format";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard },
  { href: "/dashboard/inventario", label: "Inventario de Autos", icon: Car },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
  { href: "/dashboard/contactos", label: "Contactos", icon: Mail },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors",
              isActive
                ? "bg-champagne-400 font-medium text-black"
                : "text-ink-300 hover:bg-obsidian-800 hover:text-ink-100",
            )}
          >
            <Icon size={17} strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
