"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/format";
import { compressImage } from "@/lib/image-compression";

export interface PhotoSlot {
  id: number;
  label: string;
  category: "frontal" | "lateral" | "trasera" | "centro" | "interior";
  x: number; // Posición porcentual X sobre el diagrama SVG
  y: number; // Posición porcentual Y sobre el diagrama SVG
  file?: File | null;
  previewUrl?: string | null;
  /** Set when this slot's current photo is an untouched existing one
   *  (EditCarModal) rather than a newly attached file — cleared as soon
   *  as the slot is replaced or removed. */
  existingUrl?: string | null;
  existingPath?: string | null;
}

export type PhotoEntry = { type: "existing"; url: string; path?: string } | { type: "new"; file: File };

// 10 posiciones — el máximo de fotos por auto, una por posición.
const INITIAL_SLOTS: PhotoSlot[] = [
  { id: 1, label: "Frontal ángulo izquierdo", category: "frontal", x: 25, y: 15 },
  { id: 2, label: "Frontal directo", category: "frontal", x: 50, y: 10 },
  { id: 3, label: "Frontal ángulo derecho", category: "frontal", x: 75, y: 15 },
  { id: 4, label: "Perfil izquierdo", category: "lateral", x: 15, y: 50 },
  { id: 5, label: "Perfil derecho", category: "lateral", x: 85, y: 50 },
  { id: 6, label: "Trasera ángulo izquierdo", category: "trasera", x: 25, y: 85 },
  { id: 7, label: "Trasera directa", category: "trasera", x: 50, y: 90 },
  { id: 8, label: "Trasera ángulo derecho", category: "trasera", x: 75, y: 85 },
  { id: 9, label: "Techo / vista central", category: "centro", x: 50, y: 50 },
  { id: 10, label: "Interior", category: "interior", x: 50, y: 45 },
];

function buildInitialSlots(initialPhotos: { url: string; path?: string }[]): PhotoSlot[] {
  return INITIAL_SLOTS.map((slot, index) => {
    const photo = initialPhotos[index];
    if (!photo) return slot;
    return { ...slot, previewUrl: photo.url, existingUrl: photo.url, existingPath: photo.path ?? null };
  });
}

interface CarPhotoPositionerProps {
  /** Fires with the ordered list of newly attached files from filled slots
   *  (slot order, not upload order) whenever a photo is added, replaced,
   *  or removed — used by AddCarModal, where every photo is new. Each
   *  file has already been resized/recompressed client-side (see
   *  lib/image-compression.ts) before this fires. */
  onPhotosChange?: (files: File[]) => void;
  /** Fires with every filled slot in slot order, distinguishing untouched
   *  existing photos from newly attached files — used by EditCarModal,
   *  which needs to know which of a car's current photos are still kept
   *  (to preserve their URL/Storage path) vs. new uploads. */
  onSlotsChange?: (entries: PhotoEntry[]) => void;
  /** Seeds slots 1..N with a car's current photos (EditCarModal only) —
   *  slot labels/categories are a capture aid discarded after upload, so
   *  there's no real position to restore; this just fills the diagram in
   *  order so existing photos are visible and editable from the start. */
  initialPhotos?: { url: string; path?: string }[];
}

export default function CarPhotoPositioner({ onPhotosChange, onSlotsChange, initialPhotos = [] }: CarPhotoPositionerProps) {
  const [slots, setSlots] = useState<PhotoSlot[]>(() => buildInitialSlots(initialPhotos));
  const [activeSlotId, setActiveSlotId] = useState<number | null>(1);
  const [processingSlotId, setProcessingSlotId] = useState<number | null>(null);

  useEffect(() => {
    onPhotosChange?.(slots.filter((slot) => slot.file).map((slot) => slot.file as File));

    const entries: PhotoEntry[] = [];
    for (const slot of slots) {
      if (slot.file) entries.push({ type: "new", file: slot.file });
      else if (slot.existingUrl) entries.push({ type: "existing", url: slot.existingUrl, path: slot.existingPath ?? undefined });
    }
    onSlotsChange?.(entries);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass stable setState setters; only slot content changes matter here
  }, [slots]);

  async function handleFileChange(slotId: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessingSlotId(slotId);
    try {
      // Resize/recompress in the browser (max 1920px side, capped ~3MB)
      // before it ever becomes a preview or an upload candidate.
      const processed = await compressImage(file);
      const previewUrl = URL.createObjectURL(processed);
      setSlots((current) =>
        current.map((slot) =>
          slot.id === slotId
            ? { ...slot, file: processed, previewUrl, existingUrl: null, existingPath: null }
            : slot,
        ),
      );
    } finally {
      setProcessingSlotId(null);
    }
  }

  function handleRemoveSlot(slotId: number) {
    setSlots((current) =>
      current.map((slot) =>
        slot.id === slotId
          ? { ...slot, file: null, previewUrl: null, existingUrl: null, existingPath: null }
          : slot,
      ),
    );
  }

  const activeSlot = slots.find((slot) => slot.id === activeSlotId);
  const completedCount = slots.filter((slot) => slot.previewUrl).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-ink-100">Mapeo de fotos del vehículo</h4>
          <p className="text-xs text-ink-400">
            {completedCount} de {slots.length} posiciones capturadas
          </p>
        </div>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-obsidian-800">
          <div
            className="h-full bg-champagne-400 transition-all duration-300"
            style={{ width: `${(completedCount / slots.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Diagrama interactivo vista superior */}
        <div className="relative flex aspect-[4/3] items-center justify-center rounded-2xl border border-hairline bg-obsidian-950 p-6">
          <svg viewBox="0 0 200 300" className="h-full max-h-[320px] w-full drop-shadow-sm">
            {/* Silueta minimalista del auto, vista superior */}
            <rect
              x="60"
              y="40"
              width="80"
              height="220"
              rx="30"
              className="fill-obsidian-800/60 stroke-hairline-strong stroke-1"
            />
            {/* Insinuación de parabrisas / techo de vidrio */}
            <path d="M70 85 Q100 75 130 85 L125 180 Q100 190 75 180 Z" className="fill-obsidian-700/40" />

            {slots.map((slot) => {
              const cx = (slot.x / 100) * 200;
              const cy = (slot.y / 100) * 300;
              const isFilled = Boolean(slot.previewUrl);
              const isActive = slot.id === activeSlotId;

              return (
                <g key={slot.id} onClick={() => setActiveSlotId(slot.id)} className="group cursor-pointer">
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 11 : 9}
                    className={cn(
                      "transition-all duration-200",
                      isActive
                        ? "fill-champagne-400 stroke-obsidian-950 stroke-2"
                        : isFilled
                          ? "fill-emerald-500 stroke-obsidian-950/40 stroke-1"
                          : "fill-obsidian-900 stroke-hairline-strong stroke-1",
                    )}
                  />
                  <text
                    x={cx}
                    y={cy + 3.5}
                    textAnchor="middle"
                    className={cn(
                      "select-none text-[8px] font-bold",
                      isActive ? "fill-black" : isFilled ? "fill-white" : "fill-ink-300",
                    )}
                  >
                    {slot.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Cargador e inspector de la posición seleccionada */}
        <div className="flex flex-col justify-between rounded-2xl border border-hairline bg-obsidian-900 p-5">
          {activeSlot ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-600">
                    Posición #{activeSlot.id} • {activeSlot.category}
                  </span>
                  <h5 className="text-sm font-semibold text-ink-100">{activeSlot.label}</h5>
                </div>
                {activeSlot.previewUrl && (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                    Lista
                  </span>
                )}
              </div>

              {processingSlotId === activeSlot.id ? (
                <div className="flex aspect-video w-full items-center justify-center gap-2 rounded-xl bg-obsidian-800 text-sm text-ink-400">
                  <Loader2 size={16} className="animate-spin" />
                  Procesando imagen…
                </div>
              ) : activeSlot.previewUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-obsidian-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeSlot.previewUrl} alt={activeSlot.label} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(activeSlot.id)}
                    aria-label="Quitar foto"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-obsidian-950/80 text-ink-100 backdrop-blur-md transition-colors hover:bg-red-500/80"
                  >
                    <X size={14} />
                  </button>
                  <label className="absolute right-2 bottom-2 cursor-pointer rounded-lg bg-obsidian-950/80 px-3 py-1.5 text-xs font-medium text-ink-100 backdrop-blur-md hover:bg-obsidian-950">
                    Reemplazar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleFileChange(activeSlot.id, event)}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-hairline-strong bg-obsidian-950 transition-colors hover:border-champagne-400/60">
                  <span className="text-xs font-medium text-ink-300">Subir foto: {activeSlot.label}</span>
                  <span className="mt-1 text-[11px] text-ink-600">
                    Se redimensiona y comprime automáticamente
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleFileChange(activeSlot.id, event)}
                  />
                </label>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-600">
              Seleccioná un número de posición en el diagrama.
            </div>
          )}

          {/* Selector rápido en grilla de posiciones */}
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-hairline pt-4">
            {slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setActiveSlotId(slot.id)}
                title={slot.label}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-all",
                  slot.id === activeSlotId
                    ? "bg-champagne-400 text-black"
                    : slot.previewUrl
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-obsidian-800 text-ink-400 hover:bg-obsidian-700",
                )}
              >
                {slot.id}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
