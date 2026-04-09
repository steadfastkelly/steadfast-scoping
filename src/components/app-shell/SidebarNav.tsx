import {
  Database,
  FileUp,
  History,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";

export function SidebarNav() {
  return (
    <aside className="flex w-60 flex-col bg-slate-50">
      <div className="flex items-center gap-3 px-4 py-5">
        <Database className="h-6 w-6 text-teal-600" />
        <span className="text-lg font-bold text-slate-900">DataFlow</span>
      </div>
      <nav className="flex flex-col gap-1 px-3 py-2">
        <SidebarNavItem icon={LayoutDashboard} label="Dashboard" />
        <SidebarNavItem icon={FileUp} label="Data Import" active />
        <SidebarNavItem icon={Settings} label="Settings" />
        <SidebarNavItem icon={History} label="Import History" />
      </nav>
    </aside>
  );
}
