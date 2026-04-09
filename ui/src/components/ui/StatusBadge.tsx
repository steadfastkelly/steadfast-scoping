import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "./Badge";

type StatusTone = "success" | "warning" | "neutral";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
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
    <Badge className="gap-1.5" tone={tone}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
