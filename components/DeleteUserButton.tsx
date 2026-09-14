"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteUser } from "@/app/dashboard/usuarios/actions";

export default function DeleteUserButton({ uid }: { uid: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (pending) return;
    if (!window.confirm("¿Eliminar este usuario?")) return;
    setPending(true);
    await deleteUser(uid);
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      aria-label="Eliminar usuario"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-obsidian-800 hover:text-red-400 disabled:opacity-60"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}
