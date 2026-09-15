"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { onAuthStateChanged, type User } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Check, Loader2, Plus, X } from "lucide-react";
import { getFirebaseAuth, getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import { cn } from "@/lib/format";
import CarPhotoPositioner from "./CarPhotoPositioner";
import PillToggle from "./PillToggle";

type Transmission = "Manual" | "Automática";
type FuelType = "Nafta" | "Diesel" | "Híbrido" | "Eléctrico";
type Status = "idle" | "uploading" | "saving" | "success" | "error";

const TRANSMISSIONS: Transmission[] = ["Manual", "Automática"];
const FUEL_TYPES: FuelType[] = ["Nafta", "Diesel", "Híbrido", "Eléctrico"];

const FEATURES = [
  "Aire Acondicionado",
  "Dirección Hidráulica",
  "Airbags",
  "Frenos ABS",
  "Vidrios Eléctricos",
  "Alarma",
  "Llantas de Aleación",
  "Cierre Centralizado",
  "Bluetooth",
  "Sensores de Estacionamiento",
];

export default function AddCarModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const [transmission, setTransmission] = useState<Transmission>("Automática");
  const [fuelType, setFuelType] = useState<FuelType>("Nafta");
  const [featured, setFeatured] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [files, setFiles] = useState<File[]>([]);

  const formRef = useRef<HTMLFormElement>(null);

  // Firebase's client SDK restores a signed-in session from IndexedDB
  // asynchronously — gate submission on it so a fast submit right after
  // page load can't race an auth state that hasn't resolved yet.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (current) => {
      setUser(current);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  function toggleFeature(feature: string) {
    setSelectedFeatures((current) => {
      const next = new Set(current);
      if (next.has(feature)) next.delete(feature);
      else next.add(feature);
      return next;
    });
  }

  function resetForm() {
    formRef.current?.reset();
    setTransmission("Automática");
    setFuelType("Nafta");
    setFeatured(false);
    setSelectedFeatures(new Set());
    setFiles([]);
  }

  function closeModal() {
    if (status === "uploading" || status === "saving") return;
    setOpen(false);
    setStatus("idle");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "uploading" || status === "saving") return;

    if (!authReady || !user) {
      setError("Su sesión todavía se está cargando — espere un segundo e intente de nuevo.");
      setStatus("error");
      return;
    }

    const data = new FormData(event.currentTarget);
    const make = String(data.get("make") || "").trim();
    const model = String(data.get("model") || "").trim();
    const year = Number(data.get("year"));
    const price = Number(data.get("price"));
    const mileage = Number(data.get("mileage"));
    const color = String(data.get("color") || "").trim();
    const description = String(data.get("description") || "").trim();

    if (!make || !model || !year || !price) {
      setError("Complete al menos marca, modelo, año y precio.");
      setStatus("error");
      return;
    }

    try {
      setError("");
      setStatus("uploading");
      const storage = getFirebaseStorage();
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const path = `cars/${crypto.randomUUID()}-${file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          return { url, path };
        }),
      );

      setStatus("saving");
      await addDoc(collection(getFirebaseDb(), "cars"), {
        make,
        model,
        year,
        price,
        mileage: mileage || 0,
        transmission,
        fuelType,
        color,
        description,
        features: Array.from(selectedFeatures),
        images: uploaded.map((item) => item.url),
        imagePaths: uploaded.map((item) => item.path),
        image: uploaded[0]?.url ?? "",
        featured,
        createdAt: serverTimestamp(),
      });

      setStatus("success");
      router.refresh();
      window.setTimeout(() => {
        resetForm();
        setOpen(false);
        setStatus("idle");
      }, 1100);
    } catch {
      setError("No se pudo guardar el auto. Intente nuevamente.");
      setStatus("error");
    }
  }

  const isBusy = status === "uploading" || status === "saving";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-champagne-400 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-champagne-300 active:scale-[0.97]"
      >
        <Plus size={15} />
        Agregar Auto
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-obsidian-900/95 p-6 backdrop-blur-md sm:p-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight text-ink-100">Agregar auto</h2>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Cerrar"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-obsidian-800 hover:text-ink-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="mt-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Marca">
                    <input name="make" required placeholder="Toyota" className={inputClass} />
                  </Field>
                  <Field label="Modelo">
                    <input name="model" required placeholder="Hilux DX" className={inputClass} />
                  </Field>
                  <Field label="Año">
                    <input name="year" type="number" required placeholder="2020" className={inputClass} />
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Field label="Precio (USD)">
                    <input name="price" type="number" required placeholder="18500" className={inputClass} />
                  </Field>
                  <Field label="Kilometraje">
                    <input name="mileage" type="number" placeholder="45000" className={inputClass} />
                  </Field>
                  <Field label="Color">
                    <input name="color" placeholder="Blanco Perlado" className={inputClass} />
                  </Field>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-sm text-ink-400">Transmisión</p>
                  <div className="flex flex-wrap gap-2">
                    {TRANSMISSIONS.map((option) => (
                      <PillToggle
                        key={option}
                        label={option}
                        active={transmission === option}
                        onClick={() => setTransmission(option)}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-sm text-ink-400">Combustible</p>
                  <div className="flex flex-wrap gap-2">
                    {FUEL_TYPES.map((option) => (
                      <PillToggle
                        key={option}
                        label={option}
                        active={fuelType === option}
                        onClick={() => setFuelType(option)}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-sm text-ink-400">Equipamiento</p>
                  <div className="flex flex-wrap gap-2">
                    {FEATURES.map((feature) => (
                      <PillToggle
                        key={feature}
                        label={feature}
                        active={selectedFeatures.has(feature)}
                        onClick={() => toggleFeature(feature)}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <Field label="Descripción">
                    <textarea
                      name="description"
                      rows={4}
                      placeholder="Estado general, historial de mantenimiento, detalles a destacar…"
                      className={cn(inputClass, "resize-none")}
                    />
                  </Field>
                </div>

                <label className="mt-5 flex items-center gap-2.5 text-sm text-ink-300">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(event) => setFeatured(event.target.checked)}
                    className="h-4 w-4 rounded border-hairline-strong bg-obsidian-950 accent-champagne-400"
                  />
                  Destacar en la portada
                </label>

                <div className="mt-5">
                  <CarPhotoPositioner onPhotosChange={setFiles} />
                </div>

                {status === "error" && <p className="mt-4 text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={isBusy}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-champagne-400 py-3.5 text-[0.9375rem] font-medium text-black transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.97] disabled:opacity-70 disabled:active:scale-100"
                >
                  {status === "uploading" && (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Subiendo fotos…
                    </>
                  )}
                  {status === "saving" && (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Guardando…
                    </>
                  )}
                  {status === "success" && (
                    <>
                      <Check size={16} />
                      Auto agregado
                    </>
                  )}
                  {(status === "idle" || status === "error") && "Guardar auto"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const inputClass =
  "w-full rounded-xl border border-hairline bg-obsidian-950 px-4 py-2.5 text-sm text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-ink-400">{label}</label>
      {children}
    </div>
  );
}
