import type { ReactNode } from "react";
import { Card } from "../ui/Card";
import { SidebarNav } from "./SidebarNav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <Card className="flex min-h-screen overflow-hidden rounded-2xl">
      <SidebarNav />
      <main className="flex-1 bg-white p-8">{children}</main>
    </Card>
  );
}
