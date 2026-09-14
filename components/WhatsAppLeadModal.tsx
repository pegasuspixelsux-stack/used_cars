"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Loader2, MessageCircle, X } from "lucide-react";
import { getFirebaseDb } from "@/lib/firebase";

type Status = "idle" | "loading";

const inputClass =
  "w-full rounded-xl border border-hairline bg-obsidian-950 px-3.5 py-2.5 text-sm text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400";

interface WhatsAppLeadModalProps {
  open: boolean;
  onClose: () => void;
  /** Digits only, no "+" or spaces — settings.whatsappNumber. */
  whatsappNumber: string;
  /** e.g. "Volkswagen Gol Trend (2021) — US$ 13.900" — included in the lead
   *  and the prefilled WhatsApp message. Omit for a general inquiry. */
  vehicleContext?: string;
  /** Seeds the form from whatever the visitor already typed elsewhere
   *  (VehicleInquiryForm's inline fields) so they don't retype it. */
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
}

/**
 * Captures name/email/phone + consent, logs the lead to Firestore's
 * `contacts` collection (best-effort — a failed write never blocks the
 * WhatsApp handoff itself, which is what the visitor actually came for),
 * then opens a prefilled wa.me link. `stage: "new_lead"` is written for a
 * future pipeline view; the dashboard's Contactos list doesn't group by
 * stage yet.
 */
export default function WhatsAppLeadModal({
  open,
  onClose,
  whatsappNumber,
  vehicleContext = "",
  initialName = "",
  initialEmail = "",
  initialPhone = "",
}: WhatsAppLeadModalProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  // Re-seed from the caller's current values (and reset consent/status)
  // every time the modal (re)opens, rather than only on first mount.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-seeding on open, not a render-triggered loop
    setName(initialName);
    setEmail(initialEmail);
    setPhone(initialPhone);
    setConsent(false);
    setStatus("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-seed on open, not on every keystroke upstream
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent || status === "loading") return;
    setStatus("loading");

    try {
      await addDoc(collection(getFirebaseDb(), "contacts"), {
        name,
        email,
        phone,
        message: vehicleContext ? `Consulta sobre ${vehicleContext}.` : "Consulta por WhatsApp.",
        // Firestore rejects `undefined` field values outright — omit the
        // key entirely for a general (non-vehicle) inquiry instead.
        ...(vehicleContext ? { vehicleOfInterest: vehicleContext } : {}),
        stage: "new_lead",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("WhatsAppLeadModal: could not log lead", error);
    }

    const intro = `Hola! Soy ${name}.`;
    const context = vehicleContext
      ? ` Me interesa el ${vehicleContext}.`
      : " Quisiera más información sobre el inventario.";
    const text = encodeURIComponent(`${intro}${context} Mi correo es ${email}.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank", "noopener,noreferrer");

    setStatus("idle");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-obsidian-900/95 p-6 backdrop-blur-md sm:p-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-ink-100">Contactar por WhatsApp</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-obsidian-800 hover:text-ink-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="wa-lead-name" className="mb-1.5 block text-sm text-ink-400">
                  Nombre completo
                </label>
                <input
                  id="wa-lead-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Juana Pérez"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="wa-lead-email" className="mb-1.5 block text-sm text-ink-400">
                  Correo electrónico
                </label>
                <input
                  id="wa-lead-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="usted@email.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="wa-lead-phone" className="mb-1.5 block text-sm text-ink-400">
                  Teléfono
                </label>
                <input
                  id="wa-lead-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+598 99 123 456"
                  className={inputClass}
                />
              </div>

              <label className="flex items-start gap-2.5 pt-1 text-xs leading-relaxed text-ink-400">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-hairline-strong bg-obsidian-950 accent-champagne-400"
                />
                Acepto que guarden mis datos de contacto para el seguimiento de
                esta consulta y para enviarme un mensaje de WhatsApp con esta
                información.
              </label>

              <button
                type="submit"
                disabled={!consent || status === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-champagne-400 py-3.5 text-[0.9375rem] font-medium text-black transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Abriendo WhatsApp…
                  </>
                ) : (
                  <>
                    <MessageCircle size={16} />
                    Continuar a WhatsApp
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
