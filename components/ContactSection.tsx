"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { MapPin, Phone, Mail, MessageCircle, Clock, Check, Loader2 } from "lucide-react";
import { inventory } from "@/lib/vehicles";

type SubmitState = "idle" | "loading" | "success";

const CHANNELS = [
  { icon: MapPin, label: "Ruta 10, Km 161, Punta del Este, Uruguay" },
  { icon: Phone, label: "+598 4249 1122" },
  { icon: MessageCircle, label: "+598 99 123 456 (WhatsApp)" },
  { icon: Mail, label: "hola@aeromotors.uy" },
];

const HOURS = [
  { day: "Lunes a viernes", time: "10:00 – 19:00" },
  { day: "Sábado", time: "10:00 – 15:00" },
  { day: "Domingo", time: "Con cita previa" },
];

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
    <section id="contact" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-16 px-6 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:px-16">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-ink-100 sm:text-4xl">
            Visite el showroom
          </h2>
          <p className="mt-4 max-w-sm text-ink-400">
            Hable directamente con un especialista, o déjenos sus datos y
            nos comunicaremos dentro de un día hábil.
          </p>

          <ul className="mt-10 space-y-4">
            {CHANNELS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3.5 text-ink-300">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline">
                  <Icon size={17} strokeWidth={1.75} className="text-champagne-400" />
                </span>
                <span className="text-[0.9375rem]">{label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-center gap-3.5 border-t border-hairline pt-8">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline">
              <Clock size={17} strokeWidth={1.75} className="text-champagne-400" />
            </span>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[0.9375rem]">
              {HOURS.map(({ day, time }) => (
                <div key={day} className="contents">
                  <dt className="text-ink-400">{day}</dt>
                  <dd className="text-ink-300">{time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-hairline bg-obsidian-900 p-6 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre completo" htmlFor="name">
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-hairline bg-obsidian-950 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
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
                className="w-full rounded-xl border border-hairline bg-obsidian-950 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
                placeholder="+598 99 123 456"
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Vehículo de interés" htmlFor="vehicle">
              <select
                id="vehicle"
                name="vehicle"
                defaultValue=""
                className="w-full appearance-none rounded-xl border border-hairline bg-obsidian-950 px-4 py-3 text-ink-100 outline-none transition-colors focus:border-champagne-400"
              >
                <option value="" disabled>
                  Seleccione un modelo
                </option>
                {inventory.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </option>
                ))}
                <option value="other">Otro</option>
              </select>
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Mensaje" htmlFor="message">
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full resize-none rounded-xl border border-hairline bg-obsidian-950 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
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
      <label htmlFor={htmlFor} className="mb-2 block text-sm text-ink-400">
        {label}
      </label>
      {children}
    </div>
  );
}
