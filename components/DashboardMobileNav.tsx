"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";

/**
 * Mobile-only burger menu for the dashboard header — replaces the old
 * always-expanded inline sidebar strip. Opens a dropdown panel with the
 * signed-in admin's email, the same nav items as the desktop sidebar, and
 * a "Cerrar sesión" entry, since there's no separate header LogoutButton
 * in this layout anymore.
 */
export default function DashboardMobileNav({ email }: { email?: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close whenever the route actually changes (a nav link was followed).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- closing on route change, not a render-triggered loop
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-obsidian-800 hover:text-ink-100"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-30"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-40 mt-2 w-64 rounded-2xl border border-hairline bg-obsidian-900 p-3 shadow-2xl"
            >
              {email && <p className="mb-2 truncate px-3.5 pt-1 text-xs text-ink-600">{email}</p>}
              <DashboardSidebar onNavigate={() => setOpen(false)} showLogout />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
