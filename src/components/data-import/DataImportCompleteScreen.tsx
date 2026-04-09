import { CheckCircle2 } from "lucide-react";
import { AppShell } from "../app-shell/AppShell";
import { Button } from "../ui/Button";
import { StatCard } from "../ui/StatCard";
import { StepIndicator } from "../ui/StepIndicator";
import { DataImportPageHeader } from "./DataImportPageHeader";

type DataImportCompleteScreenProps = {
  onImportAnotherFile?: () => void;
  onGoToDashboard?: () => void;
};

export function DataImportCompleteScreen({
  onImportAnotherFile,
  onGoToDashboard,
}: DataImportCompleteScreenProps) {
  return (
    <AppShell>
      <div className="flex flex-col gap-7">
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

        <section className="flex flex-col items-center gap-5 rounded-2xl bg-slate-50 px-8 py-10 text-center">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Import Successful!
            </h2>
            <p className="mx-auto max-w-md text-sm text-slate-600">
              Your data has been processed and is now available in the system.
            </p>
          </div>

          <div className="flex w-full gap-4">
            <StatCard value="24,851" label="Rows Imported" />
            <StatCard value="12" label="Columns Mapped" />
            <StatCard value="0" label="Errors Found" />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onImportAnotherFile}>
              Import Another File
            </Button>
            <Button onClick={onGoToDashboard}>Go To Dashboard</Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
