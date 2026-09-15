"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { LayoutDashboard, Car, Users, Mail, Settings, LogOut } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { logout } from "@/app/dashboard/actions";
import { cn } from "@/lib/format";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard },
  { href: "/dashboard/inventario", label: "Inventario de Autos", icon: Car },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
  { href: "/dashboard/contactos", label: "Contactos", icon: Mail },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
];

interface DashboardSidebarProps {
  /** Fires after a nav link (or the logout entry) is clicked — lets the
   *  mobile burger menu (DashboardMobileNav) close itself on navigation. */
  onNavigate?: () => void;
  /** Renders a "Cerrar sesión" entry styled like the other nav items, for
   *  contexts (the mobile burger menu) that have no separate LogoutButton. */
  showLogout?: boolean;
}

export default function DashboardSidebar({ onNavigate, showLogout }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
    await signOut(getFirebaseAuth()).catch(() => {});
    onNavigate?.();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
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

      {showLogout && (
        <>
          <div className="my-2 border-t border-hairline" />
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-ink-300 transition-colors hover:bg-obsidian-800 hover:text-ink-100",
              loggingOut && "opacity-60",
            )}
          >
            <LogOut size={17} strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </>
      )}
    </nav>
  );
}
