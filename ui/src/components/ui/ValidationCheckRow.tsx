import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";

type ValidationCheckRowProps = {
  title: string;
  description: string;
  tone?: "success" | "warning";
};

export function ValidationCheckRow({
  title,
  description,
  tone = "success",
}: ValidationCheckRowProps) {
  const isWarning = tone === "warning";
  const Icon = isWarning ? AlertTriangle : CheckCircle2;

  return (
    <Card
      className={[
        "flex items-center gap-4 p-4",
        isWarning
          ? "border-amber-300 bg-amber-50"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <Icon
        className={[
          "h-5 w-5 shrink-0",
          isWarning ? "text-amber-600" : "text-emerald-600",
        ].join(" ")}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p
          className={[
            "text-sm",
            isWarning ? "text-amber-700" : "text-slate-500",
          ].join(" ")}
        >
          {description}
        </p>
      </div>
      <StatusBadge
        label={isWarning ? "Warning" : "Valid"}
        tone={isWarning ? "warning" : "success"}
      />
    </Card>
  );
}
