"use client";

import { useRef, useState, type FormEvent } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { createUser } from "@/app/dashboard/usuarios/actions";

type Status = "idle" | "loading" | "error";

export default function AddUserForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError("");

    const formData = new FormData(event.currentTarget);
    const result = await createUser(formData);

    if (result.ok) {
      formRef.current?.reset();
      setStatus("idle");
    } else {
      setError(result.error);
      setStatus("error");
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-3xl border border-hairline bg-obsidian-900 p-6"
    >
      <h2 className="text-sm font-medium text-ink-100">Nuevo usuario</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <input
          name="email"
          type="email"
          required
          placeholder="Correo electrónico"
          className="rounded-xl border border-hairline bg-obsidian-950 px-4 py-2.5 text-sm text-ink-100 outline-none placeholder:text-ink-600 focus:border-champagne-400"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Contraseña temporal"
          className="rounded-xl border border-hairline bg-obsidian-950 px-4 py-2.5 text-sm text-ink-100 outline-none placeholder:text-ink-600 focus:border-champagne-400"
        />
      </div>

      {status === "error" && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 flex items-center gap-2 rounded-full bg-champagne-400 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-champagne-300 active:scale-[0.97] disabled:opacity-70"
      >
        {status === "loading" ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <UserPlus size={15} />
        )}
        Crear usuario
      </button>
    </form>
  );
}
