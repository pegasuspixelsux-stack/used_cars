"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useTheme } from "next-themes";
import { Check, Loader2 } from "lucide-react";
import { getFirebaseDb } from "@/lib/firebase";

type SubmitState = "idle" | "loading" | "success" | "error";

// Fallback when the admin hasn't uploaded a contact image for a theme
// (app/dashboard/settings/page.tsx) — same stock photo either way.
const FALLBACK_BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1717347424087-842a99131d8e";

interface ContactSectionProps {
  imageLight: string;
  imageDark: string;
}

export default function ContactSection({ imageLight, imageDark }: ContactSectionProps) {
  const [status, setStatus] = useState<SubmitState>("idle");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration guard
  useEffect(() => setMounted(true), []);
  // Theme resolves client-side only (next-themes) — default to the dark
  // image before mount, matching this site's default theme, same guard
  // Navbar.tsx/Hero.tsx use for their own theme-dependent styling.
  const isLight = mounted && resolvedTheme === "light";
  const backgroundImage = (isLight ? imageLight : imageDark) || imageDark || imageLight || FALLBACK_BACKGROUND_IMAGE;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      await addDoc(collection(getFirebaseDb(), "contacts"), {
        name: String(data.get("name") || ""),
        phone: String(data.get("phone") || ""),
        email: String(data.get("email") || ""),
        message: String(data.get("message") || ""),
        createdAt: serverTimestamp(),
      });
      form.reset();
      setStatus("success");
      window.setTimeout(() => setStatus("idle"), 2400);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 3200);
    }
  }

  return (
    <section id="contact" className="relative w-full overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Auto en la sala de exhibición de Aero Motors"
          fill
          sizes="100vw"
          quality={60}
          className="object-cover object-center"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-obsidian-950/0 via-obsidian-950/0 to-obsidian-950/0"
      />

      <div className="relative z-10 mx-auto grid max-w-[1400px] gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-16">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            No dejes que conducir el auto que querés se quede solo en un
            sueño.
          </h2>
          <p className="mt-5 max-w-md text-white/80">
            Ya tenés el dinero para la seña o entrega inicial. Con un pequeño
            esfuerzo y una cuota mensual accesible, vas a estar manejando el
            auto que realmente querés y merecés. Comprá el vehículo que te
            gusta manejar, no te conformes con menos.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-hairline bg-obsidian-950/60 p-6 backdrop-blur-md sm:p-8 lg:ml-auto lg:w-full lg:max-w-md"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre completo" htmlFor="name">
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-hairline bg-obsidian-950/90 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
                placeholder="Juana Pérez"
              />
            </Field>
            <Field label="Teléfono" htmlFor="phone">
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                className="w-full rounded-xl border border-hairline bg-obsidian-950/90 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
                placeholder="+598 99 123 456"
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Correo electrónico" htmlFor="email">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-hairline bg-obsidian-950/90 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
                placeholder="usted@email.com"
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Mensaje" htmlFor="message">
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="w-full resize-none rounded-xl border border-hairline bg-obsidian-950/90 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
                placeholder="Cuéntenos qué está buscando…"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={status !== "idle"}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-champagne-400 py-3.5 text-[0.9375rem] font-medium text-black transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.97] disabled:active:scale-100"
          >
            {status === "idle" && "Enviar mensaje"}
            {status === "loading" && (
              <>
                <Loader2 size={16} className="animate-spin" />
                Enviando…
              </>
            )}
            {status === "success" && (
              <>
                <Check size={16} />
                Mensaje enviado
              </>
            )}
            {status === "error" && "No se pudo enviar. Intente nuevamente."}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm text-ink-300">
        {label}
      </label>
      {children}
    </div>
  );
}
