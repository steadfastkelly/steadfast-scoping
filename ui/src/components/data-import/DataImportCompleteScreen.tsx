import { CheckCircle2 } from "lucide-react";
import { AppShell } from "../app-shell/AppShell";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { StatCard } from "../ui/StatCard";
import { StepIndicator } from "../ui/StepIndicator";
import { DataImportPageHeader } from "./DataImportPageHeader";

export function DataImportCompleteScreen() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <DataImportPageHeader
          title="Import Complete"
          description="Your data has been successfully imported"
        />

        <StepIndicator
          steps={[
            { label: "Upload", state: "complete" },
            { label: "Validate", state: "complete" },
            { label: "Complete", state: "complete" },
          ]}
        />

        <Card className="flex flex-col items-center gap-6 p-8 text-center">
          <div className="flex h-18 w-18 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              Import Successful!
            </h2>
            <p className="mx-auto max-w-md text-sm text-slate-600">
              Your data has been processed and is now available in the system.
            </p>
          </div>

          <div className="grid w-full gap-4 md:grid-cols-3">
            <StatCard value="24,851" label="Rows Imported" />
            <StatCard value="12" label="Columns Mapped" />
            <StatCard value="0" label="Errors Found" />
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button variant="secondary">Import Another File</Button>
            <Button>Go To Dashboard</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
