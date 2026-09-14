"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";

const NAV_LINKS = [
  { label: "Inventario", href: "#inventory" },
  { label: "Por qué elegirnos", href: "#why-us" },
  { label: "Contacto", href: "#contact" },
];

const LEGAL_LINKS = [
  { label: "Términos del servicio", href: "#" },
  { label: "Política de privacidad", href: "#" },
  { label: "Términos de garantía", href: "#" },
];

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribed(true);
  }

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <a href="#" className="flex items-baseline gap-1.5 leading-none">
              <span className="text-lg font-semibold tracking-tight text-ink-100">AERO</span>
              <span className="text-lg font-normal tracking-tight text-ink-400">MOTORS</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
              Seleccionamos y certificamos vehículos premium usados para
              Punta del Este, con total transparencia desde la inspección
              hasta la entrega.
            </p>
            <p className="mt-8 text-sm text-ink-600">
              © {new Date().getFullYear()} Aero Motors. Todos los derechos
              reservados.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-ink-100">Navegación</h3>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-ink-400 transition-colors hover:text-ink-100"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-ink-100">Legal y soporte</h3>
            <ul className="mt-5 space-y-3">
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-champagne-400 text-obsidian-950 transition-transform duration-150 active:scale-90 disabled:opacity-90"
                >
                  {subscribed ? <Check size={16} /> : <ArrowRight size={16} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
