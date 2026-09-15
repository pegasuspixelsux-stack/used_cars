"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { createSession } from "@/app/login/actions";

type Status = "idle" | "loading" | "error";
type ResetStatus = "idle" | "sending" | "sent" | "error";

function mapAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Correo o contraseña incorrectos.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intente de nuevo en unos minutos.";
    default:
      return "No se pudo iniciar sesión. Intente nuevamente.";
  }
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [resetStatus, setResetStatus] = useState<ResetStatus>("idle");
  const [resetError, setResetError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError("");

    try {
      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      const idToken = await credential.user.getIdToken();
      const result = await createSession(idToken);
      if (!result.ok) throw new Error(result.error);

      router.push(next);
      router.refresh();
    } catch (err) {
      const code = err instanceof Error && "code" in err ? String((err as { code: string }).code) : "";
      setError(mapAuthError(code));
      setStatus("error");
    }
  }

  async function handleResetPassword() {
    if (resetStatus === "sending") return;
    if (!email) {
      setResetStatus("error");
      setResetError("Ingrese su correo arriba primero.");
      return;
    }

    setResetStatus("sending");
    setResetError("");
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
    } catch (err) {
      // Firebase's own error for "no user with this email" would let
      // someone enumerate admin accounts — show the same success message
      // either way, same as most login flows.
      const code = err instanceof Error && "code" in err ? String((err as { code: string }).code) : "";
      if (code === "auth/invalid-email") {
        setResetStatus("error");
        setResetError("Ingrese un correo válido.");
        return;
      }
    }
    setResetStatus("sent");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-ink-400">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-hairline bg-obsidian-900 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
            placeholder="admin@aeromotors.uy"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-ink-400">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-hairline bg-obsidian-900 px-4 py-3 text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="mt-3 text-right">
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={resetStatus === "sending"}
          className="text-sm text-ink-400 underline-offset-2 transition-colors hover:text-champagne-400 hover:underline disabled:opacity-60"
        >
          {resetStatus === "sending" ? "Enviando…" : "¿Olvidó su contraseña?"}
        </button>
      </div>

      {resetStatus === "sent" && (
        <p className="mt-2 text-sm text-emerald-500">
          Si el correo existe, le enviamos un enlace para restablecer la contraseña.
        </p>
      )}
      {resetStatus === "error" && <p className="mt-2 text-sm text-red-400">{resetError}</p>}

      {status === "error" && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-champagne-400 py-3.5 text-[0.9375rem] font-medium text-black transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.97] disabled:opacity-70 disabled:active:scale-100"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Ingresando…
          </>
        ) : (
          "Iniciar sesión"
        )}
      </button>
    </form>
  );
}
