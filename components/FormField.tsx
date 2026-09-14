import type { ReactNode } from "react";

export default function FormField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="block text-sm text-ink-400">
          {label}
        </label>
        {hint && <span className="text-xs text-ink-600">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
