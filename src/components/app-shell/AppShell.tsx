import type { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen overflow-hidden rounded-2xl bg-white">
      <SidebarNav />
      <main className="flex-1 bg-white px-10 py-8">{children}</main>
    </div>
  );
}
