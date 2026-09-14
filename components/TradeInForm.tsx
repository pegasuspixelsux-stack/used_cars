"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";
import { Zap, ArrowLeftRight, BadgeCheck, ImagePlus, X, Check, Loader2 } from "lucide-react";
import FormField from "./FormField";

type Condition = "Excelente" | "Bueno" | "Regular";
type SubmitState = "idle" | "loading" | "success";

const CONDITIONS: Condition[] = ["Excelente", "Bueno", "Regular"];

const HIGHLIGHTS = [
  { icon: Zap, label: "Tasación instantánea" },
  { icon: ArrowLeftRight, label: "Transición sin fricciones" },
  { icon: BadgeCheck, label: "Cero complicaciones" },
];

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function TradeInForm() {
  const [condition, setCondition] = useState<Condition>("Excelente");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<SubmitState>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(
    () => files.map((file) => ({ key: fileKey(file), file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const next = Array.from(incoming).filter((file) => file.type.startsWith("image/"));
    setFiles((current) => {
      const existingKeys = new Set(current.map(fileKey));
      const deduped = next.filter((file) => !existingKeys.has(fileKey(file)));
      return [...current, ...deduped];
    });
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function removeFile(key: string) {
    setFiles((current) => current.filter((file) => fileKey(file) !== key));
  }

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
    <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
      <div>
        <h3 className="text-2xl font-semibold leading-snug tracking-tight text-ink-100 sm:text-[1.75rem]">
          Que el auto que maneja hoy no le impida tener el auto que quiere.
        </h3>
        <p className="mt-4 max-w-sm text-ink-400">
          Ya tiene valor en el auto que maneja. Entréguelo como parte de
          pago, reduzca sus cuotas y llévese el vehículo que realmente
          quiere.
        </p>

        <ul className="mt-10 space-y-4">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3.5 text-ink-300">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline">
                <Icon size={17} strokeWidth={1.75} className="text-champagne-400" />
              </span>
              <span className="text-[0.9375rem]">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-hairline bg-obsidian-900 p-6 sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Marca" htmlFor="trade-make">
            <input
              id="trade-make"
              name="make"
              type="text"
              required
              placeholder="Toyota"
              className="w-full rounded-xl border border-hairline bg-obsidian-950 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
            />
          </FormField>
          <FormField label="Modelo" htmlFor="trade-model">
            <input
              id="trade-model"
              name="model"
              type="text"
              required
              placeholder="Corolla"
              className="w-full rounded-xl border border-hairline bg-obsidian-950 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
            />
          </FormField>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField label="Año" htmlFor="trade-year">
            <input
              id="trade-year"
              name="year"
              type="number"
              required
              min={1990}
              max={2026}
              placeholder="2020"
              className="w-full rounded-xl border border-hairline bg-obsidian-950 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
            />
          </FormField>
          <FormField label="Kilometraje" htmlFor="trade-mileage">
            <input
              id="trade-mileage"
              name="mileage"
              type="number"
              required
              min={0}
              placeholder="45000"
              className="w-full rounded-xl border border-hairline bg-obsidian-950 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
            />
          </FormField>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm text-ink-400">Estado general</p>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCondition(option)}
                aria-pressed={condition === option}
                className={
                  condition === option
                    ? "rounded-full bg-champagne-400 px-4 py-2 text-sm font-medium text-obsidian-950 transition-transform active:scale-[0.97]"
                    : "rounded-full border border-hairline px-4 py-2 text-sm text-ink-300 transition-colors hover:border-hairline-strong hover:text-ink-100 active:scale-[0.97]"
                }
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField label="Nombre completo" htmlFor="trade-name">
            <input
              id="trade-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Juana Pérez"
              className="w-full rounded-xl border border-hairline bg-obsidian-950 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
            />
          </FormField>
          <FormField label="Teléfono" htmlFor="trade-phone">
            <input
              id="trade-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+598 99 123 456"
              className="w-full rounded-xl border border-hairline bg-obsidian-950 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
            />
          </FormField>
        </div>

        <div className="mt-5">
          <FormField label="Correo electrónico" htmlFor="trade-email">
            <input
              id="trade-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="usted@email.com"
              className="w-full rounded-xl border border-hairline bg-obsidian-950 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
            />
          </FormField>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm text-ink-400">Fotos del vehículo</p>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
            }}
            className={
              isDragging
                ? "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-champagne-400 bg-obsidian-950 px-4 py-8 text-center transition-colors"
                : "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong bg-obsidian-950 px-4 py-8 text-center transition-colors hover:border-champagne-400/60"
            }
          >
            <ImagePlus size={22} strokeWidth={1.5} className="text-champagne-400" />
            <p className="text-sm text-ink-300">
              Arrastre las imágenes aquí o haga clic para seleccionar
            </p>
            <p className="text-xs text-ink-600">PNG o JPG, opcional</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => addFiles(event.target.files)}
            />
          </div>

          {previews.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3">
              {previews.map((preview) => (
                <li key={preview.key} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-hairline">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview.url} alt={preview.file.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(preview.key)}
                    aria-label={`Quitar ${preview.file.name}`}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-obsidian-950/80 text-ink-100 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={status !== "idle"}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-champagne-400 py-3.5 text-[0.9375rem] font-medium text-obsidian-950 transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.97] disabled:active:scale-100"
        >
          {status === "idle" && "Obtener tasación instantánea"}
          {status === "loading" && (
            <>
              <Loader2 size={16} className="animate-spin" />
              Enviando…
            </>
          )}
          {status === "success" && (
            <>
              <Check size={16} />
              Solicitud enviada
            </>
          )}
        </button>
      </form>
    </div>
  );
}
