import { Check } from "lucide-react";

type Step = {
  label: string;
  state: "current" | "complete" | "upcoming";
};

type StepIndicatorProps = {
  steps: Step[];
};

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-4">
      {steps.map((step, index) => {
        const isComplete = step.state === "complete";
        const isCurrent = step.state === "current";

        return (
          <div key={step.label} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                  isComplete
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-teal-600 text-white"
                      : "bg-slate-200 text-slate-500",
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
                      ? "font-semibold text-teal-600"
                      : "text-slate-500",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={[
                  "h-0.5 w-20",
                  isComplete ? "bg-emerald-600" : "bg-slate-200",
                ].join(" ")}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
