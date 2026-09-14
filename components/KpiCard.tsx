import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}

export default function KpiCard({ icon: Icon, label, value, hint }: KpiCardProps) {
  return (
    <div className="rounded-3xl border border-hairline bg-obsidian-900 p-6">
      <div className="flex items-center gap-2.5 text-ink-400">
        <Icon size={16} strokeWidth={1.75} className="text-champagne-400" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-3 font-mono text-3xl text-ink-100">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-600">{hint}</p>}
    </div>
  );
}
