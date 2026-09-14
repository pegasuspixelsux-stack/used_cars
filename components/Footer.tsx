"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { splitLogoText } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { label: "Inventario", href: "/inventory" },
  { label: "Financiación", href: "#tools" },
  { label: "Cotizar mi usado", href: "#tools" },
  { label: "Por qué elegirnos", href: "#why-us" },
];

const LEGAL_LINKS = [
  { label: "Términos del servicio", href: "#" },
  { label: "Política de privacidad", href: "#" },
  { label: "Términos de garantía", href: "#" },
];

// Not part of app/dashboard/settings/page.tsx — kept as a fixed channel
// alongside the dynamic ones below.
const SUPPORT_EMAIL = "hola@aeromotors.uy";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const [subscribed, setSubscribed] = useState(false);
  const [logoFirst, logoRest] = splitLogoText(settings.logoText);

  const channels = [
    { icon: MapPin, label: settings.address },
    { icon: Phone, label: settings.phone },
    { icon: MessageCircle, label: `+${settings.whatsappNumber} (WhatsApp)` },
    { icon: Clock, label: settings.hours },
    { icon: Mail, label: SUPPORT_EMAIL },
  ].filter((channel) => channel.label.trim());

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribed(true);
  }

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <Link href="/" className="flex items-baseline gap-1.5 leading-none">
              <span className="text-lg font-semibold tracking-tight text-ink-100">{logoFirst}</span>
              {logoRest && <span className="text-lg font-normal tracking-tight text-ink-400">{logoRest}</span>}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
              Concesionario local de autos usados en Punta del Este, con
              inspección mecánica completa y total transparencia en cada
              venta.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-ink-100">Navegación</h3>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-400 transition-colors hover:text-ink-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-ink-100">Contacto</h3>
            <ul className="mt-5 space-y-3">
              {channels.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-2.5 text-sm text-ink-400">
                  <Icon size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-champagne-400" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-ink-100">Manténgase informado</h3>
            <p className="mt-5 text-sm leading-relaxed text-ink-400">
              Novedades de stock y notas del mercado, como máximo una vez al
              mes.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4">
              <div className="flex items-center gap-2 rounded-full border border-hairline bg-obsidian-900 p-1.5">
                <input
                  type="email"
                  required
                  disabled={subscribed}
                  placeholder="tu@email.com"
                  aria-label="Dirección de correo electrónico"
                  className="w-full bg-transparent px-3.5 py-2 text-sm text-ink-100 outline-none placeholder:text-ink-600 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  aria-label="Suscribirse"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-champagne-400 text-black transition-transform duration-150 active:scale-90 disabled:opacity-90"
                >
                  {subscribed ? <Check size={16} /> : <ArrowRight size={16} />}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t border-hairline pt-8 sm:flex-row sm:justify-between sm:gap-4">
          <p className="text-sm text-ink-600">
            © {new Date().getFullYear()} Aero Motors. Todos los derechos
            reservados.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-ink-400 transition-colors hover:text-ink-100"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="text-sm text-ink-400 transition-colors hover:text-ink-100"
              >
                Iniciar sesión
              </Link>
            </li>
          </ul>
          <ThemeToggle label="Modo claro" />
        </div>
      </div>
    </footer>
  );
}
