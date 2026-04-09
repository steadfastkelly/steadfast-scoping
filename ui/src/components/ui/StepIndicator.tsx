import { Check } from "lucide-react";
import { Card } from "./Card";

type Step = {
  label: string;
  state: "current" | "complete" | "upcoming";
};

type StepIndicatorProps = {
  steps: Step[];
};

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <Card className="flex flex-wrap items-center gap-4 p-4">
      {steps.map((step, index) => {
        const isComplete = step.state === "complete";
        const isCurrent = step.state === "current";

        return (
          <div key={step.label} className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                  isComplete
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={[
                  "text-sm",
                  isComplete
                    ? "font-medium text-emerald-600"
                    : isCurrent
                      ? "font-semibold text-slate-900"
                      : "text-slate-500",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={[
                  "h-px w-10 bg-slate-200 sm:w-16",
                  isComplete ? "bg-emerald-600" : "bg-slate-200",
                ].join(" ")}
              />
            ) : null}
          </div>
        );
      })}
    </Card>
  );
}
