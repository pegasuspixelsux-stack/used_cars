"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/format";

interface ThemeToggleProps {
  className?: string;
  /** Optional text label rendered to the left of the switch (used in the footer). */
  label?: string;
}

export default function ThemeToggle({ className, label }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoids a hydration mismatch: the server can't know the stored preference,
  // so render the same neutral ("dark") state on both passes until mounted.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {label && <span className="text-sm text-ink-400">{label}</span>}
      <button
        type="button"
        onClick={() => setTheme(isLight ? "dark" : "light")}
        aria-label={isLight ? "Activar modo oscuro" : "Activar modo claro"}
        aria-pressed={isLight}
        className="relative inline-flex h-7 w-[3.25rem] shrink-0 items-center rounded-full border border-hairline-strong bg-obsidian-800 px-1 transition-colors active:scale-[0.96]"
      >
        <Sun
          size={13}
          strokeWidth={2}
          className="pointer-events-none absolute left-[7px] text-ink-600"
        />
        <Moon
          size={13}
          strokeWidth={2}
          className="pointer-events-none absolute right-[7px] text-ink-600"
        />
        <motion.span
          layout
          transition={{ type: "spring", bounce: 0, duration: 0.35 }}
          style={{ marginLeft: isLight ? "auto" : 0 }}
          className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-champagne-400 text-black shadow-sm"
        >
          {isLight ? <Sun size={12} strokeWidth={2.25} /> : <Moon size={12} strokeWidth={2.25} />}
        </motion.span>
      </button>
    </div>
  );
}
