"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { logout } from "@/app/dashboard/actions";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (pending) return;
    setPending(true);
    await logout();
    await signOut(getFirebaseAuth()).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-sm text-ink-300 transition-colors hover:border-hairline-strong hover:text-ink-100 disabled:opacity-60"
    >
      <LogOut size={15} strokeWidth={1.75} />
      Cerrar sesión
    </button>
  );
}
