import type { HTMLAttributes, ReactNode } from "react";

type BadgeTone = "success" | "warning" | "neutral";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  neutral: "bg-slate-100 text-slate-700",
};

export function Badge({
  children,
  className = "",
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
