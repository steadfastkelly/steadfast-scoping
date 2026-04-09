import { FileText, Shield, Zap } from "lucide-react";
import { AppShell } from "../app-shell/AppShell";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { StepIndicator } from "../ui/StepIndicator";
import { DataImportPageHeader } from "./DataImportPageHeader";
import { FileDropZone } from "./FileDropZone";

function UploadInfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <Card className="flex h-full flex-1 flex-col gap-4 p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200">
        <Icon className="h-5 w-5 text-slate-700" />
      </div>
      <div className="space-y-2">
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </Card>
  );
}

export function DataImportUploadScreen() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <DataImportPageHeader
          title="Import Data"
          description="Upload your data file to begin the import process."
        />

        <StepIndicator
          steps={[
            { label: "Upload", state: "current" },
            { label: "Validate", state: "upcoming" },
            { label: "Complete", state: "upcoming" },
          ]}
        />

        <Card className="space-y-8 p-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Step 1
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Upload your source file
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-500">
              Select a file to begin the import workflow. Your data will be
              validated before anything is processed or committed.
            </p>
          </div>

          <FileDropZone />
        </Card>

        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">
              Before you upload
            </h3>
            <p className="text-sm leading-6 text-slate-500">
              A few quick details to make sure your import goes smoothly.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
          <UploadInfoCard
            icon={FileText}
            title="Supported formats"
            description="CSV, XLSX, and JSON files are accepted for import."
          />
          <UploadInfoCard
            icon={Shield}
            title="Secure handling"
            description="Files are processed with the same protected workflow used across the dashboard."
          />
          <UploadInfoCard
            icon={Zap}
            title="Fast processing"
            description="Optimized for large imports and streamlined validation."
          />
          </div>
        </section>

        <Card className="flex items-center justify-between gap-6 p-6">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-slate-900">
              Ready to continue
            </p>
            <p className="text-sm leading-6 text-slate-500">
              Move to validation after choosing the correct source file.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary">Cancel</Button>
            <Button className="min-w-28">Continue</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
