"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { splitLogoText } from "@/lib/format";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Inventario", href: "/inventory" },
  { label: "Por qué elegirnos", href: "#why-us" },
  { label: "Servicios", href: "#why-us" },
  { label: "Contacto", href: "#contact" },
];

export default function Navbar({ logoText }: { logoText: string }) {
  const [logoFirst, logoRest] = splitLogoText(logoText);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const { resolvedTheme } = useTheme();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration guard
  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";

  // Frosted bar intensifies as the page scrolls, instead of snapping between two states.
  // Base tints track the current theme's page background / primary text hue.
  const baseRgb = isLight ? "250, 250, 248" : "10, 11, 13";
  const lineRgb = isLight ? "20, 22, 26" : "244, 245, 247";
  const background = useTransform(scrollY, [0, 80], [`rgba(${baseRgb}, 0.35)`, `rgba(${baseRgb}, 0.82)`]);
  const borderColor = useTransform(scrollY, [0, 80], [`rgba(${lineRgb}, 0)`, `rgba(${lineRgb}, 0.08)`]);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 backdrop-blur-xl"
      style={{
        backgroundColor: background,
        borderBottom: "1px solid",
        borderBottomColor: borderColor,
      }}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-baseline gap-1.5 leading-none">
          <span className="text-lg font-semibold tracking-tight text-ink-100">{logoFirst}</span>
          {logoRest && <span className="text-lg font-normal tracking-tight text-ink-400">{logoRest}</span>}
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-[0.9375rem] text-ink-300 transition-colors duration-200 hover:text-ink-100"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          <a
            href="#contact"
            className="inline-flex items-center rounded-full bg-champagne-400 px-5 py-2.5 text-sm font-medium text-black transition-transform duration-150 ease-out hover:bg-champagne-300 active:scale-[0.97]"
          >
            Coordinar una consulta
          </a>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex items-center justify-center rounded-full border border-hairline p-2.5 text-ink-100"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-hairline bg-obsidian-950/95 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-4 sm:px-10">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-2.5 text-base text-ink-300 transition-colors hover:text-ink-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <a
                  href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center rounded-full bg-champagne-400 px-5 py-2.5 text-sm font-medium text-black active:scale-[0.97]"
                >
                  Coordinar una consulta
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
