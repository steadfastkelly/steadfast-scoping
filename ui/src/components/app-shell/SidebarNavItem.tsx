import type { LucideIcon } from "lucide-react";

type SidebarNavItemProps = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

export function SidebarNavItem({
  label,
  icon: Icon,
  active = false,
}: SidebarNavItemProps) {
  return (
    <button
      className={[
        "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
        active
          ? "bg-teal-50 font-semibold text-teal-700"
          : "text-slate-600 hover:bg-slate-100",
      ].join(" ")}
      type="button"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
