import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";

type StatusTone = "success" | "warning" | "neutral";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
};

const toneClasses: Record<StatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  neutral: "bg-slate-100 text-slate-700",
};

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  neutral: Circle,
};

export function StatusBadge({
  label,
  tone = "neutral",
}: StatusBadgeProps) {
  const Icon = icons[tone];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        toneClasses[tone],
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
