"use client";

/**
 * Shared pill-shaped toggle button — used for the transmission/fuel/feature
 * grids in AddCarModal and the inventory filters sidebar.
 */
export default function PillToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "rounded-full bg-champagne-400 px-3.5 py-1.5 text-xs font-medium text-black transition-transform active:scale-[0.97]"
          : "rounded-full border border-hairline px-3.5 py-1.5 text-xs text-ink-300 transition-colors hover:border-hairline-strong hover:text-ink-100 active:scale-[0.97]"
      }
    >
      {label}
    </button>
  );
}
