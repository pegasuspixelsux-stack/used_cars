"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { Check, Loader2 } from "lucide-react";

type SubmitState = "idle" | "loading" | "success";

const BACKGROUND_IMAGE = {
  src: "https://images.unsplash.com/photo-1717347424087-842a99131d8e",
  alt: "Auto deportivo blanco estacionado en un garage",
};

export default function ContactSection() {
  const [status, setStatus] = useState<SubmitState>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle") return;
    setStatus("loading");
    window.setTimeout(() => {
      setStatus("success");
      window.setTimeout(() => setStatus("idle"), 2400);
    }, 900);
  }

  return (
    <section id="contact" className="relative w-full overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0">
        <Image
          src={BACKGROUND_IMAGE.src}
          alt={BACKGROUND_IMAGE.alt}
          fill
          sizes="100vw"
          quality={60}
          className="object-cover object-center"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-obsidian-950/60 via-obsidian-950/40 to-obsidian-950/60"
      />

      <div className="relative z-10 mx-auto grid max-w-[1400px] gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-16">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-ink-100 sm:text-4xl">
            ¿Listo para encontrar su próximo auto?
            <br />
            Hablemos.
          </h2>
          <p className="mt-4 max-w-sm text-ink-300">
            Cuéntenos qué está buscando y le respondemos dentro de un día
            hábil.
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
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-champagne-400 py-3.5 text-[0.9375rem] font-medium text-obsidian-950 transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.97] disabled:active:scale-100"
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
