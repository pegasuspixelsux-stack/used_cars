"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { AlertTriangle, Check, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import * as XLSX from "xlsx";
import { getFirebaseDb } from "@/lib/firebase";
import { cn } from "@/lib/format";

type Transmission = "Manual" | "Automática";
type FuelType = "Nafta" | "Diesel" | "Híbrido" | "Eléctrico";
type Status = "idle" | "parsing" | "importing" | "done" | "error";

interface ParsedRow {
  rowNumber: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: Transmission;
  fuelType: FuelType;
  color: string;
  description: string;
  features: string[];
  featured: boolean;
  image: string;
  error?: string;
}

// Accepted column headers (accent/case-insensitive) → internal field.
// "año"/"ano" both normalize to "ano" after accent-stripping below.
const HEADER_MAP: Record<string, keyof ParsedRow | "raw"> = {
  marca: "make",
  modelo: "model",
  ano: "year",
  anio: "year",
  year: "year",
  precio: "price",
  price: "price",
  kilometraje: "mileage",
  km: "mileage",
  mileage: "mileage",
  color: "color",
  transmision: "transmission",
  transmission: "transmission",
  combustible: "fuelType",
  fuel: "fuelType",
  destacado: "featured",
  featured: "featured",
  descripcion: "description",
  description: "description",
  equipamiento: "features",
  features: "features",
  imagen: "image",
  foto: "image",
  image: "image",
};

function normalizeHeader(header: string): string {
  return header
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

function parseTransmission(value: unknown): Transmission {
  const normalized = normalizeHeader(String(value ?? ""));
  return normalized.startsWith("man") ? "Manual" : "Automática";
}

function parseFuelType(value: unknown): FuelType {
  const normalized = normalizeHeader(String(value ?? ""));
  if (normalized.startsWith("die")) return "Diesel";
  if (normalized.startsWith("hib") || normalized.startsWith("hyb")) return "Híbrido";
  if (normalized.startsWith("ele")) return "Eléctrico";
  return "Nafta";
}

function parseFeatured(value: unknown): boolean {
  const normalized = normalizeHeader(String(value ?? ""));
  return ["si", "sí", "true", "1", "x", "yes"].includes(normalized);
}

function parseFeatures(value: unknown): string[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  return raw
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value: unknown): number {
  const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toParsedRow(rawRow: Record<string, unknown>, rowNumber: number): ParsedRow {
  const mapped: Partial<Record<keyof ParsedRow, unknown>> = {};
  for (const [header, value] of Object.entries(rawRow)) {
    const field = HEADER_MAP[normalizeHeader(header)];
    if (field && field !== "raw") mapped[field] = value;
  }

  const make = String(mapped.make ?? "").trim();
  const model = String(mapped.model ?? "").trim();
  const year = parseNumber(mapped.year);
  const price = parseNumber(mapped.price);

  const row: ParsedRow = {
    rowNumber,
    make,
    model,
    year,
    price,
    mileage: parseNumber(mapped.mileage),
    transmission: parseTransmission(mapped.transmission),
    fuelType: parseFuelType(mapped.fuelType),
    color: String(mapped.color ?? "").trim(),
    description: String(mapped.description ?? "").trim(),
    features: parseFeatures(mapped.features),
    featured: parseFeatured(mapped.featured),
    image: String(mapped.image ?? "").trim(),
  };

  if (!make || !model || !year || !price) {
    row.error = "Faltan datos obligatorios (marca, modelo, año o precio).";
  }

  return row;
}

/**
 * Bulk-imports cars from a CSV or Excel (.xlsx/.xls) file — parsed
 * entirely in the browser via the `xlsx` package (reads both formats),
 * so it works the same whether the admin exports from Excel, Sheets, or
 * a plain CSV. Only text fields are imported; there's no column for
 * photos beyond an optional single external image URL — cars still need
 * their real photo set added afterward via EditCarModal/CarPhotoPositioner.
 */
export default function ImportCarsModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function closeModal() {
    if (status === "importing") return;
    setOpen(false);
    setStatus("idle");
    setError("");
    setRows([]);
    setResult(null);
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setStatus("parsing");
    setError("");
    setResult(null);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) throw new Error("empty");

      const sheet = workbook.Sheets[firstSheet];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      if (!raw.length) throw new Error("empty");

      setRows(raw.map((row, index) => toParsedRow(row, index + 2)));
      setStatus("idle");
    } catch {
      setError("No se pudo leer el archivo. Verifique que sea un .csv, .xlsx o .xls válido.");
      setStatus("error");
      setRows([]);
    }
  }

  const validRows = rows.filter((row) => !row.error);
  const invalidRows = rows.filter((row) => row.error);

  async function handleImport() {
    if (status === "importing" || !validRows.length) return;
    setStatus("importing");

    const outcomes = await Promise.all(
      validRows.map(async (row) => {
        try {
          await addDoc(collection(getFirebaseDb(), "cars"), {
            make: row.make,
            model: row.model,
            year: row.year,
            price: row.price,
            mileage: row.mileage || 0,
            transmission: row.transmission,
            fuelType: row.fuelType,
            color: row.color,
            description: row.description,
            features: row.features,
            ...(row.image ? { images: [row.image], image: row.image } : { image: "" }),
            featured: row.featured,
            createdAt: serverTimestamp(),
          });
          return true;
        } catch {
          return false;
        }
      }),
    );

    const success = outcomes.filter(Boolean).length;
    setResult({ success, failed: outcomes.length - success });
    setStatus("done");
    router.refresh();
  }

  const isBusy = status === "parsing" || status === "importing";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-hairline-strong px-5 py-2.5 text-sm font-medium text-ink-100 transition-colors hover:bg-obsidian-800 active:scale-[0.97]"
      >
        <FileSpreadsheet size={15} />
        Importar Excel/CSV
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
                <h2 className="text-xl font-semibold tracking-tight text-ink-100">Importar autos</h2>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Cerrar"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-obsidian-800 hover:text-ink-100"
                >
                  <X size={18} />
                </button>
              </div>

              {status === "done" && result ? (
                <div className="mt-6 rounded-xl border border-hairline bg-obsidian-950 p-6 text-center">
                  <Check size={28} className="mx-auto text-emerald-500" />
                  <p className="mt-3 text-sm text-ink-100">
                    {result.success} {result.success === 1 ? "auto importado" : "autos importados"}
                    {result.failed > 0 && `, ${result.failed} con error`}.
                  </p>
                  <p className="mt-1 text-xs text-ink-600">
                    Las fotos de cada auto se agregan por separado desde &quot;Editar&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-5 rounded-full bg-champagne-400 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-champagne-300"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  <p className="mt-2 text-sm text-ink-400">
                    Suba un archivo .csv, .xlsx o .xls con columnas: marca, modelo, año, precio,
                    kilometraje, color, transmisión, combustible, equipamiento (separado por &quot;;&quot;),
                    descripción, destacado.
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={status === "parsing"}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong bg-obsidian-950 px-4 py-8 text-sm text-ink-300 transition-colors hover:border-champagne-400/60 disabled:opacity-60"
                  >
                    {status === "parsing" ? (
                      <Loader2 size={18} className="animate-spin text-champagne-400" />
                    ) : (
                      <Upload size={18} className="text-champagne-400" />
                    )}
                    {status === "parsing" ? "Leyendo archivo…" : "Seleccionar archivo .csv, .xlsx o .xls"}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={handleFileSelected}
                    />
                  </button>

                  {status === "error" && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
                      <AlertTriangle size={15} />
                      {error}
                    </p>
                  )}

                  {rows.length > 0 && (
                    <div className="mt-5">
                      <p className="text-sm text-ink-300">
                        {validRows.length} {validRows.length === 1 ? "fila lista" : "filas listas"} para
                        importar
                        {invalidRows.length > 0 && `, ${invalidRows.length} con errores`}.
                      </p>

                      <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-hairline">
                        <table className="w-full text-left text-xs">
                          <thead className="sticky top-0 bg-obsidian-800 text-ink-400">
                            <tr>
                              <th className="px-3 py-2">Fila</th>
                              <th className="px-3 py-2">Auto</th>
                              <th className="px-3 py-2">Año</th>
                              <th className="px-3 py-2">Precio</th>
                              <th className="px-3 py-2">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row) => (
                              <tr key={row.rowNumber} className="border-t border-hairline">
                                <td className="px-3 py-2 text-ink-600">{row.rowNumber}</td>
                                <td className="px-3 py-2 text-ink-100">
                                  {row.make || "—"} {row.model}
                                </td>
                                <td className="px-3 py-2 text-ink-400">{row.year || "—"}</td>
                                <td className="px-3 py-2 text-ink-400">{row.price || "—"}</td>
                                <td className="px-3 py-2">
                                  {row.error ? (
                                    <span className="text-red-400">{row.error}</span>
                                  ) : (
                                    <span className="text-emerald-500">Lista</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={!validRows.length || isBusy}
                    className={cn(
                      "mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-champagne-400 py-3.5 text-[0.9375rem] font-medium text-black transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100",
                    )}
                  >
                    {status === "importing" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Importando…
                      </>
                    ) : (
                      `Importar ${validRows.length ? validRows.length : ""} auto${validRows.length === 1 ? "" : "s"}`.trim()
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
