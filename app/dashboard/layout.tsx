import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SESSION_COOKIE_NAME, verifySessionCookie } from "@/lib/session";
import DashboardMobileNav from "@/components/DashboardMobileNav";
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
      <aside className="hidden w-64 shrink-0 border-r border-hairline md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <Link href="/" className="shrink-0 px-6 pt-6 flex items-baseline gap-1.5 leading-none">
          <span className="text-lg font-semibold tracking-tight text-ink-100">AERO</span>
          <span className="text-lg font-normal tracking-tight text-ink-400">MOTORS</span>
        </Link>
        <div className="mt-10 flex-1 overflow-y-auto px-6">
          <DashboardSidebar />
        </div>
        <div className="shrink-0 px-6 pb-6">
          <Link
            href="/"
            className="mb-4 flex items-center gap-2 text-sm text-ink-400 transition-colors hover:text-ink-100"
          >
            <ArrowLeft size={15} />
            Volver al sitio
          </Link>
          <p className="mb-3 truncate text-xs text-ink-600">{claims.email}</p>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4 md:hidden">
          <span className="text-sm font-medium text-ink-100">AERO MOTORS</span>
          <DashboardMobileNav email={claims.email} />
        </header>

        <main className="flex-1 p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
