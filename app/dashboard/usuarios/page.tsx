import { cookies } from "next/headers";
import AddUserForm from "@/components/AddUserForm";
import DeleteUserButton from "@/components/DeleteUserButton";
import { getAllUsers } from "@/lib/dashboard-data";
import { SESSION_COOKIE_NAME, verifySessionCookie } from "@/lib/session";

export const metadata = {
  title: "Usuarios — Aero Motors",
};

function formatDate(ms: number | null): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("es-UY", { dateStyle: "medium", timeStyle: "short" }).format(ms);
}

export default async function UsersPage() {
  const store = await cookies();
  const claims = await verifySessionCookie(store.get(SESSION_COOKIE_NAME)?.value);
  const users = await getAllUsers();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-100">Usuarios</h1>
      <p className="mt-1 text-sm text-ink-400">
        {users.length} {users.length === 1 ? "usuario con acceso" : "usuarios con acceso"} al panel.
      </p>

      <div className="mt-8">
        <AddUserForm />
      </div>

      <div className="mt-8 space-y-3">
        {users.map((user) => (
          <div
            key={user.uid}
            className="flex items-center gap-4 rounded-2xl border border-hairline bg-obsidian-900 p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-100">{user.email}</p>
              <p className="text-xs text-ink-600">
                Creado {formatDate(user.createdAt)} · Último acceso {formatDate(user.lastSignInAt)}
              </p>
            </div>
            {claims?.uid !== user.uid && <DeleteUserButton uid={user.uid} />}
          </div>
        ))}
      </div>
    </div>
  );
}
