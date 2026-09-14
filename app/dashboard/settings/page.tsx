import SettingsForm from "@/components/SettingsForm";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata = {
  title: "Configuración — Aero Motors",
};

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-100">Configuración</h1>
      <p className="mt-1 text-sm text-ink-400">
        Marca, contacto y horario del sitio público — se aplican en todo el
        sitio en cuanto se guardan.
      </p>

      <SettingsForm settings={settings} />
    </div>
  );
}
