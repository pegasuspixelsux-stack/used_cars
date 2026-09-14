"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";

/**
 * Compact numbered pagination. Collapses long runs with an ellipsis but
 * always keeps the first/last page and a window around the current one
 * reachable in a single click.
 */
export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav
      aria-label="Paginación del inventario"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
        className="inline-flex h-9 items-center gap-1 rounded-full border border-hairline px-3 text-sm text-ink-300 transition-colors hover:border-hairline-strong hover:text-ink-100 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft size={15} />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <ul className="flex items-center gap-1">
        {pages.map((entry, index) =>
          entry === "ellipsis" ? (
            <li key={`ellipsis-${index}`} className="px-1.5 text-sm text-ink-600">
              …
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                onClick={() => onChange(entry)}
                aria-current={entry === page ? "page" : undefined}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                  entry === page
                    ? "bg-champagne-400 font-medium text-black"
                    : "text-ink-300 hover:bg-obsidian-800 hover:text-ink-100",
                )}
              >
                {entry}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
        className="inline-flex h-9 items-center gap-1 rounded-full border border-hairline px-3 text-sm text-ink-300 transition-colors hover:border-hairline-strong hover:text-ink-100 disabled:pointer-events-none disabled:opacity-40"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}

function buildPageList(page: number, totalPages: number): Array<number | "ellipsis"> {
  const window = 1;
  const pages = new Set<number>([1, totalPages]);
  for (let i = page - window; i <= page + window; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  let previous = 0;
  for (const current of sorted) {
    if (previous && current - previous > 1) result.push("ellipsis");
    result.push(current);
    previous = current;
  }
  return result;
}
