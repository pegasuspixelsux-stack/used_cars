"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Check, ImagePlus, Loader2 } from "lucide-react";
import { getFirebaseAuth, getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import type { SiteSettings } from "@/lib/types";

type Status = "idle" | "uploading" | "saving" | "success" | "error";
type HeroTheme = "light" | "dark";

const inputClass =
  "w-full rounded-xl border border-hairline bg-obsidian-950 px-4 py-2.5 text-sm text-ink-100 outline-none transition-colors placeholder:text-ink-600 focus:border-champagne-400";

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const [logoText, setLogoText] = useState(settings.logoText);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [hours, setHours] = useState(settings.hours);

  const [heroFiles, setHeroFiles] = useState<Record<HeroTheme, File | null>>({ light: null, dark: null });
  const [heroPreviews, setHeroPreviews] = useState<Record<HeroTheme, string>>({
    light: settings.heroImageLight,
    dark: settings.heroImageDark,
  });

  // Firebase's client SDK restores a signed-in session from IndexedDB
  // asynchronously — gate submission on it so a fast submit right after
  // page load can't race an auth state that hasn't resolved yet.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (current) => {
      setUser(current);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  function handleHeroFile(theme: HeroTheme, file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setHeroFiles((current) => ({ ...current, [theme]: file }));
    setHeroPreviews((current) => {
      if (current[theme].startsWith("blob:")) URL.revokeObjectURL(current[theme]);
      return { ...current, [theme]: URL.createObjectURL(file) };
    });
  }

  useEffect(() => {
    return () => {
      Object.values(heroPreviews).forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only clean up on unmount
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "uploading" || status === "saving") return;

    if (!authReady || !user) {
      setError("Su sesión todavía se está cargando — espere un segundo e intente de nuevo.");
      setStatus("error");
      return;
    }

    if (!logoText.trim()) {
      setError("El nombre de la marca no puede estar vacío.");
      setStatus("error");
      return;
    }

    try {
      setError("");
      let heroImageLight = settings.heroImageLight;
      let heroImageLightPath = settings.heroImageLightPath;
      let heroImageDark = settings.heroImageDark;
      let heroImageDarkPath = settings.heroImageDarkPath;

      if (heroFiles.light || heroFiles.dark) {
        setStatus("uploading");
        const storage = getFirebaseStorage();

        if (heroFiles.light) {
          const file = heroFiles.light;
          const path = `settings/hero-light-${crypto.randomUUID()}-${file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, file);
          heroImageLight = await getDownloadURL(storageRef);
          // Best-effort cleanup of the previous file — a stale upload left
          // behind in Storage isn't worth failing the save over.
          if (settings.heroImageLightPath && settings.heroImageLightPath !== path) {
            deleteObject(ref(storage, settings.heroImageLightPath)).catch(() => {});
          }
          heroImageLightPath = path;
        }

        if (heroFiles.dark) {
          const file = heroFiles.dark;
          const path = `settings/hero-dark-${crypto.randomUUID()}-${file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, file);
          heroImageDark = await getDownloadURL(storageRef);
          if (settings.heroImageDarkPath && settings.heroImageDarkPath !== path) {
            deleteObject(ref(storage, settings.heroImageDarkPath)).catch(() => {});
          }
          heroImageDarkPath = path;
        }
      }

      setStatus("saving");
      await setDoc(
        doc(getFirebaseDb(), "settings", "general"),
        {
          logoText: logoText.trim(),
          whatsappNumber: whatsappNumber.trim(),
          phone: phone.trim(),
          address: address.trim(),
          hours: hours.trim(),
          heroImageLight,
          heroImageLightPath,
          heroImageDark,
          heroImageDarkPath,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setStatus("success");
      router.refresh();
      window.setTimeout(() => setStatus("idle"), 2400);
    } catch {
      setError("No se pudo guardar la configuración. Intente nuevamente.");
      setStatus("error");
    }
  }

  const isBusy = status === "uploading" || status === "saving";

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-10">
      <section>
        <h2 className="text-sm font-medium text-ink-100">Imagen principal</h2>
        <p className="mt-1 text-sm text-ink-400">
          Se muestra de fondo en la portada del sitio y cambia según el tema
          que esté usando el visitante. Si no carga una, se usa la foto de un
          auto destacado.
        </p>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <HeroImageField
            label="Tema oscuro"
            preview={heroPreviews.dark}
            onSelect={(file) => handleHeroFile("dark", file)}
          />
          <HeroImageField
            label="Tema claro"
            preview={heroPreviews.light}
            onSelect={(file) => handleHeroFile("light", file)}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-ink-100">Marca</h2>
        <div className="mt-4">
          <label htmlFor="settings-logo" className="mb-1.5 block text-sm text-ink-400">
            Nombre de la marca
          </label>
          <input
            id="settings-logo"
            value={logoText}
            onChange={(event) => setLogoText(event.target.value)}
            placeholder="AERO MOTORS"
            className={inputClass}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-ink-100">Contacto</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="settings-whatsapp" className="mb-1.5 block text-sm text-ink-400">
              WhatsApp (solo números)
            </label>
            <input
              id="settings-whatsapp"
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
              placeholder="59899123456"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="settings-phone" className="mb-1.5 block text-sm text-ink-400">
              Teléfono
            </label>
            <input
              id="settings-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+598 4249 1122"
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="settings-address" className="mb-1.5 block text-sm text-ink-400">
            Dirección
          </label>
          <input
            id="settings-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Ruta 10, Km 161, Punta del Este, Uruguay"
            className={inputClass}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-ink-100">Horario de atención</h2>
        <div className="mt-4">
          <label htmlFor="settings-hours" className="mb-1.5 block text-sm text-ink-400">
            Horario
          </label>
          <input
            id="settings-hours"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            placeholder="Lunes a Viernes de 9:00 a 19:00 hs"
            className={inputClass}
          />
        </div>
      </section>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isBusy}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-champagne-400 py-3.5 text-[0.9375rem] font-medium text-black transition-colors duration-200 hover:bg-champagne-300 active:scale-[0.97] disabled:opacity-70 disabled:active:scale-100 sm:w-auto sm:px-8"
      >
        {status === "uploading" && (
          <>
            <Loader2 size={16} className="animate-spin" />
            Subiendo imágenes…
          </>
        )}
        {status === "saving" && (
          <>
            <Loader2 size={16} className="animate-spin" />
            Guardando…
          </>
        )}
        {status === "success" && (
          <>
            <Check size={16} />
            Configuración guardada
          </>
        )}
        {(status === "idle" || status === "error") && "Guardar cambios"}
      </button>
    </form>
  );
}

function HeroImageField({
  label,
  preview,
  onSelect,
}: {
  label: string;
  preview: string;
  onSelect: (file: File | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="mb-2 text-sm text-ink-400">{label}</p>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-hairline bg-obsidian-900">
        {preview ? (
          // Storage download URLs and local blob: previews both work fine as
          // a plain <img> — no need for next/image's remote-pattern
          // allowlist on a value that can be a local object URL.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={`Vista previa — ${label}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-600">Sin imagen</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-hairline-strong px-4 py-2 text-sm text-ink-100 transition-colors hover:bg-obsidian-800 active:scale-[0.97]"
      >
        <ImagePlus size={15} />
        Elegir nueva imagen
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
