"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Check, ImagePlus, Loader2, Pencil, X } from "lucide-react";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import { cn } from "@/lib/format";
import { compressImage } from "@/lib/image-compression";
import type { PublicCar } from "@/lib/types";
import PillToggle from "./PillToggle";

type Transmission = "Manual" | "Automática";
type FuelType = "Nafta" | "Diesel" | "Híbrido" | "Eléctrico";
type Status = "idle" | "uploading" | "saving" | "success" | "error";

const TRANSMISSIONS: Transmission[] = ["Manual", "Automática"];
const FUEL_TYPES: FuelType[] = ["Nafta", "Diesel", "Híbrido", "Eléctrico"];
const MAX_PHOTOS = 10;

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

interface ExistingPhoto {
  url: string;
  path?: string;
}

interface NewPhoto {
  key: string;
  file: File;
  previewUrl: string;
}

function existingPhotosFrom(car: PublicCar): ExistingPhoto[] {
  if (car.images?.length) {
    return car.images.map((url, index) => ({ url, path: car.imagePaths?.[index] }));
  }
  return car.image ? [{ url: car.image, path: car.imagePaths?.[0] }] : [];
}

/**
 * Edits an existing car in place — same fields as AddCarModal, but seeded
 * from the current doc and saved with updateDoc instead of addDoc. Photo
 * position/category metadata from CarPhotoPositioner is discarded after
 * upload (see that component), so an existing car's photos are just a flat
 * list here too: kept as-is, individually removed, or added to (new files
 * get the same client-side compression as AddCarModal) up to MAX_PHOTOS.
 */
export default function EditCarModal({ car }: { car: PublicCar }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const [transmission, setTransmission] = useState<Transmission>(car.transmission);
  const [fuelType, setFuelType] = useState<FuelType>(car.fuelType);
  const [featured, setFeatured] = useState(car.featured);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set(car.features ?? []));

  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>(() => existingPhotosFrom(car));
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);
  const [compressing, setCompressing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    // Re-seed every time the modal opens, in case the row's data changed
    // (another admin edited it) since this instance last closed.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-seeding on open, not a render-triggered loop
    setTransmission(car.transmission);
    setFuelType(car.fuelType);
    setFeatured(car.featured);
    setSelectedFeatures(new Set(car.features ?? []));
    setExistingPhotos(existingPhotosFrom(car));
    setRemovedPaths([]);
    setNewPhotos([]);
    setError("");
    setStatus("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-seed on open
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-subscribe on open/close, matching AddCarModal's identical escape-key effect
  }, [open]);

  useEffect(() => {
    return () => {
      newPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [newPhotos]);

  const totalPhotoCount = existingPhotos.length + newPhotos.length;

  function removeExistingPhoto(index: number) {
    setExistingPhotos((current) => {
      const target = current[index];
      if (target?.path) setRemovedPaths((paths) => [...paths, target.path as string]);
      return current.filter((_, i) => i !== index);
    });
  }

  function removeNewPhoto(key: string) {
    setNewPhotos((current) => current.filter((photo) => photo.key !== key));
  }

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    event.target.value = "";
    if (!incoming.length) return;

    const room = MAX_PHOTOS - totalPhotoCount;
    if (room <= 0) return;

    setCompressing(true);
    try {
      const accepted = incoming.slice(0, room);
      const compressed = await Promise.all(accepted.map((file) => compressImage(file)));
      const withPreviews = compressed.map((file, index) => ({
        key: `${file.name}-${file.lastModified}-${index}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setNewPhotos((current) => [...current, ...withPreviews]);
    } finally {
      setCompressing(false);
    }
  }

  function toggleFeature(feature: string) {
    setSelectedFeatures((current) => {
      const next = new Set(current);
      if (next.has(feature)) next.delete(feature);
      else next.add(feature);
      return next;
    });
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
        newPhotos.map(async (photo) => {
          const path = `cars/${crypto.randomUUID()}-${photo.file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, photo.file);
          const url = await getDownloadURL(storageRef);
          return { url, path };
        }),
      );

      // Best-effort — a failed delete of a removed photo shouldn't block
      // saving the rest of the edit.
      await Promise.all(removedPaths.map((path) => deleteObject(ref(storage, path)).catch(() => {})));

      setStatus("saving");
      const images = [...existingPhotos.map((photo) => photo.url), ...uploaded.map((item) => item.url)];
      const imagePaths = [
        ...existingPhotos.map((photo) => photo.path).filter((path): path is string => Boolean(path)),
        ...uploaded.map((item) => item.path),
      ];

      await updateDoc(doc(getFirebaseDb(), "cars", car.id), {
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
        images,
        imagePaths,
        image: images[0] ?? "",
        featured,
        updatedAt: serverTimestamp(),
      });

      setStatus("success");
      router.refresh();
      window.setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 900);
    } catch {
      setError("No se pudo guardar los cambios. Intente nuevamente.");
      setStatus("error");
    }
  }

  const isBusy = status === "uploading" || status === "saving";
  const atPhotoLimit = totalPhotoCount >= MAX_PHOTOS;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Editar auto"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-obsidian-800 hover:text-champagne-400"
      >
        <Pencil size={15} />
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
                <h2 className="text-xl font-semibold tracking-tight text-ink-100">
                  Editar {car.make} {car.model}
                </h2>
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
                    <input name="make" required defaultValue={car.make} className={inputClass} />
                  </Field>
                  <Field label="Modelo">
                    <input name="model" required defaultValue={car.model} className={inputClass} />
                  </Field>
                  <Field label="Año">
                    <input name="year" type="number" required defaultValue={car.year} className={inputClass} />
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Field label="Precio (USD)">
                    <input name="price" type="number" required defaultValue={car.price} className={inputClass} />
                  </Field>
                  <Field label="Kilometraje">
                    <input name="mileage" type="number" defaultValue={car.mileage || ""} className={inputClass} />
                  </Field>
                  <Field label="Color">
                    <input name="color" defaultValue={car.color} className={inputClass} />
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
                      defaultValue={car.description ?? ""}
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
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm text-ink-400">Fotos</p>
                    <p className="text-xs text-ink-600">
                      {totalPhotoCount} de {MAX_PHOTOS}
                    </p>
                  </div>

                  {(existingPhotos.length > 0 || newPhotos.length > 0) && (
                    <ul className="flex flex-wrap gap-3">
                      {existingPhotos.map((photo, index) => (
                        <li
                          key={photo.url}
                          className="group relative h-16 w-16 overflow-hidden rounded-lg border border-hairline"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeExistingPhoto(index)}
                            aria-label="Quitar foto"
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-obsidian-950/80 text-ink-100 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </li>
                      ))}
                      {newPhotos.map((photo) => (
                        <li
                          key={photo.key}
                          className="group relative h-16 w-16 overflow-hidden rounded-lg border border-champagne-400/50"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.previewUrl} alt={photo.file.name} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeNewPhoto(photo.key)}
                            aria-label={`Quitar ${photo.file.name}`}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-obsidian-950/80 text-ink-100 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {!atPhotoLimit && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={compressing}
                      className={cn(
                        "mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong bg-obsidian-950 px-4 py-4 text-sm text-ink-300 transition-colors hover:border-champagne-400/60 disabled:opacity-60",
                      )}
                    >
                      {compressing ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ImagePlus size={16} className="text-champagne-400" />
                      )}
                      {compressing ? "Procesando…" : "Agregar fotos"}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFilesSelected}
                      />
                    </button>
                  )}
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
                      Cambios guardados
                    </>
                  )}
                  {(status === "idle" || status === "error") && "Guardar cambios"}
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
