import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SESSION_COOKIE_NAME, verifySessionCookie } from "@/lib/session";
import DashboardSidebar from "@/components/DashboardSidebar";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // proxy.ts already gates /dashboard/*, but a Server Component re-check
  // here means the page never even attempts to fetch Firestore without a
  // verified session — defense in depth, not reliance on proxy alone.
  const store = await cookies();
  const claims = await verifySessionCookie(store.get(SESSION_COOKIE_NAME)?.value);
  if (!claims) redirect("/login");

  return (
    <div className="flex min-h-screen bg-obsidian-950">
      <aside className="hidden w-64 shrink-0 border-r border-hairline p-6 md:flex md:flex-col">
        <Link href="/" className="mb-10 flex items-baseline gap-1.5 leading-none">
          <span className="text-lg font-semibold tracking-tight text-ink-100">AERO</span>
          <span className="text-lg font-normal tracking-tight text-ink-400">MOTORS</span>
        </Link>
        <DashboardSidebar />
        <div className="mt-auto">
          <p className="mb-3 truncate text-xs text-ink-600">{claims.email}</p>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4 md:hidden">
          <span className="text-sm font-medium text-ink-100">AERO MOTORS</span>
          <LogoutButton />
        </header>
        <div className="border-b border-hairline px-6 py-3 md:hidden">
          <DashboardSidebar />
        </div>

        <main className="flex-1 p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
