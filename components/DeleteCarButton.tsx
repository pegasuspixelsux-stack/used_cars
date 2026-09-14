"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteCar } from "@/app/dashboard/inventario/actions";

export default function DeleteCarButton({ id, imagePaths }: { id: string; imagePaths?: string[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (pending) return;
    if (!window.confirm("¿Eliminar este auto del inventario?")) return;
    setPending(true);
    await deleteCar(id, imagePaths);
    router.refresh();
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      aria-label="Eliminar auto"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-obsidian-800 hover:text-red-400 disabled:opacity-60"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}
