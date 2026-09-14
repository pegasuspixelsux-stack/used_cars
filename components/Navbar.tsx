"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Inventario", href: "#inventory" },
  { label: "Por qué elegirnos", href: "#why-us" },
  { label: "Servicios", href: "#why-us" },
  { label: "Contacto", href: "#contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Frosted bar intensifies as the page scrolls, instead of snapping between two states.
  const background = useTransform(scrollY, [0, 80], ["rgba(10, 11, 13, 0.35)", "rgba(10, 11, 13, 0.82)"]);
  const borderColor = useTransform(scrollY, [0, 80], ["rgba(244, 245, 247, 0)", "rgba(244, 245, 247, 0.08)"]);

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
        <a href="#" className="flex items-baseline gap-1.5 leading-none">
          <span className="text-lg font-semibold tracking-tight text-ink-100">AERO</span>
          <span className="text-lg font-normal tracking-tight text-ink-400">MOTORS</span>
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-[0.9375rem] text-ink-300 transition-colors duration-200 hover:text-ink-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <a
            href="#contact"
            className="inline-flex items-center rounded-full bg-champagne-400 px-5 py-2.5 text-sm font-medium text-obsidian-950 transition-transform duration-150 ease-out hover:bg-champagne-300 active:scale-[0.97]"
          >
            Coordinar una consulta
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex items-center justify-center rounded-full border border-hairline p-2.5 text-ink-100 md:hidden"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
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
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-2.5 text-base text-ink-300 transition-colors hover:text-ink-100"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a
                  href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center rounded-full bg-champagne-400 px-5 py-2.5 text-sm font-medium text-obsidian-950 active:scale-[0.97]"
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
