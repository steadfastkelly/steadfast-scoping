import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-teal-600 text-white hover:bg-teal-700 border border-transparent",
  secondary:
    "bg-white text-slate-900 hover:bg-slate-50 border border-slate-200",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
