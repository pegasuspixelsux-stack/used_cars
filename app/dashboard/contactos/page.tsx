import DeleteContactButton from "@/components/DeleteContactButton";
import { getAllContacts } from "@/lib/dashboard-data";

export const metadata = {
  title: "Contactos — Aero Motors",
};

function formatDate(ms: number): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("es-UY", { dateStyle: "medium", timeStyle: "short" }).format(ms);
}

export default async function ContactsPage() {
  const contacts = await getAllContacts();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-100">Contactos</h1>
      <p className="mt-1 text-sm text-ink-400">
        {contacts.length} {contacts.length === 1 ? "consulta recibida" : "consultas recibidas"} desde
        el sitio.
      </p>

      <div className="mt-8 space-y-3">
        {contacts.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-obsidian-900 p-6 text-sm text-ink-400">
            Todavía no llegaron consultas desde el sitio.
          </p>
        )}
        {contacts.map((contact) => (
          <div key={contact.id} className="rounded-2xl border border-hairline bg-obsidian-900 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-100">{contact.name}</p>
                <p className="mt-0.5 truncate text-sm text-ink-400">
                  {contact.email} · {contact.phone}
                </p>
                {contact.vehicleOfInterest && (
                  <p className="mt-1 truncate text-xs text-champagne-400">
                    {contact.vehicleOfInterest}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-ink-600">{formatDate(contact.createdAt)}</span>
                <DeleteContactButton id={contact.id} />
              </div>
            </div>
            {contact.message && <p className="mt-3 text-sm text-ink-300">{contact.message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
