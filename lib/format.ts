export function formatPriceUsd(value: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMileage(km: number): string {
  return `${new Intl.NumberFormat("es-UY").format(km)} km`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Splits a single brand-name string (e.g. "AERO MOTORS", edited as one
 * field in app/dashboard/settings/page.tsx) into the two parts Navbar and
 * Footer render with different weights — first word bold, the rest muted.
 * Falls back to putting the whole string in the first part when there's
 * no space to split on.
 */
export function splitLogoText(logoText: string): [string, string] {
  const trimmed = logoText.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return [trimmed, ""];
  return [trimmed.slice(0, spaceIndex), trimmed.slice(spaceIndex + 1)];
}
