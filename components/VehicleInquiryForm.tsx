"use client";

import { useState, type FormEvent } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Check, Loader2, Mail, MessageCircle } from "lucide-react";
import { getFirebaseDb } from "@/lib/firebase";
import { formatPriceUsd } from "@/lib/format";
import type { PublicCar } from "@/lib/types";
import WhatsAppLeadModal from "./WhatsAppLeadModal";

type Status = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full rounded-xl border border-hairline bg-obsidian-950 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400";

export default function VehicleInquiryForm({
  car,
  whatsappNumber,
}: {
  car: PublicCar;
  whatsappNumber: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  const vehicleLabel = `${car.make} ${car.model} (${car.year}) — ${formatPriceUsd(car.price)}`;

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");

    try {
      await addDoc(collection(getFirebaseDb(), "contacts"), {
        name,
        phone,
        email,
        message: message.trim() || `Consulta sobre ${vehicleLabel}.`,
        vehicleOfInterest: vehicleLabel,
        createdAt: serverTimestamp(),
      });
      setStatus("success");
      window.setTimeout(() => setStatus("idle"), 2400);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 3200);
    }
  }

  return (
    <>
      <form onSubmit={handleEmailSubmit} className="rounded-3xl border border-hairline bg-obsidian-900 p-6 sm:p-8">
        <h3 className="text-lg font-medium text-ink-100">¿Tenés alguna consulta sobre este vehículo?</h3>
        <p className="mt-1.5 text-sm text-ink-400">
          Escribinos y le respondemos dentro de un día hábil.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inquiry-name" className="mb-2 block text-sm text-ink-400">
              Nombre completo
            </label>
            <input
              id="inquiry-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Juana Pérez"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="inquiry-phone" className="mb-2 block text-sm text-ink-400">
              WhatsApp
            </label>
            <input
              id="inquiry-phone"
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+598 99 123 456"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="inquiry-email" className="mb-2 block text-sm text-ink-400">
            Correo electrónico
          </label>
          <input
            id="inquiry-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="usted@email.com"
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="inquiry-message" className="mb-2 block text-sm text-ink-400">
            Mensaje
          </label>
          <textarea
            id="inquiry-message"
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Cuéntenos qué le gustaría saber…"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setLeadModalOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-hairline-strong py-3.5 text-[0.9375rem] font-medium text-ink-100 transition-colors duration-200 hover:bg-obsidian-800 active:scale-[0.97]"
          >
            <MessageCircle size={16} />
            Enviar por WhatsApp
          </button>
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-champagne-400 py-3.5 text-[0.9375rem] font-medium text-black transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.97] disabled:opacity-70 disabled:active:scale-100"
          >
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
            {status === "error" && "No se pudo enviar"}
            {status === "idle" && (
              <>
                <Mail size={16} />
                Enviar por email
              </>
            )}
          </button>
        </div>
      </form>

      <WhatsAppLeadModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        whatsappNumber={whatsappNumber}
        vehicleContext={vehicleLabel}
        initialName={name}
        initialEmail={email}
        initialPhone={phone}
      />
    </>
  );
}
