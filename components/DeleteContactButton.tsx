"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteContact } from "@/app/dashboard/contactos/actions";

export default function DeleteContactButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (pending) return;
    if (!window.confirm("¿Eliminar este contacto?")) return;
    setPending(true);
    await deleteContact(id);
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      aria-label="Eliminar contacto"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-obsidian-800 hover:text-red-400 disabled:opacity-60"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}
