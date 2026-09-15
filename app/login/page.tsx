import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Iniciar sesión — Aero Motors",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-obsidian-950 px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex items-baseline justify-center gap-1.5 leading-none">
          <span className="text-lg font-semibold tracking-tight text-ink-100">AERO</span>
          <span className="text-lg font-normal tracking-tight text-ink-400">MOTORS</span>
        </Link>

        <h1 className="text-center text-2xl font-semibold tracking-tight text-ink-100">
          Acceso administrador
        </h1>
        <p className="mt-2 text-center text-sm text-ink-400">
          Ingrese sus credenciales para acceder al panel de control.
        </p>

        <div className="mt-8 flex justify-center">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <Link
          href="/"
          className="mt-8 flex items-center justify-center gap-2 text-sm text-ink-400 transition-colors hover:text-ink-100"
        >
          <ArrowLeft size={15} />
          Volver al sitio
        </Link>
      </div>
    </div>
  );
}
