import { FileText, Shield, Zap } from "lucide-react";
import { AppShell } from "../app-shell/AppShell";
import { Button } from "../ui/Button";
import { StepIndicator } from "../ui/StepIndicator";
import { DataImportPageHeader } from "./DataImportPageHeader";
import { FileDropZone } from "./FileDropZone";

type DataImportUploadScreenProps = {
  onBrowse?: () => void;
  onCancel?: () => void;
};

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
    <div className="flex flex-1 flex-col gap-2 rounded-xl bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-teal-600" />
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

export function DataImportUploadScreen({
  onBrowse,
  onCancel,
}: DataImportUploadScreenProps) {
  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <DataImportPageHeader
          title="Import Data"
          description="Upload your data file to begin the import process"
        />

        <StepIndicator
          steps={[
            { label: "Upload", state: "current" },
            { label: "Validate", state: "upcoming" },
            { label: "Complete", state: "upcoming" },
          ]}
        />

        <FileDropZone onBrowse={onBrowse} />

        <div className="flex gap-6">
          <UploadInfoCard
            icon={FileText}
            title="Supported Formats"
            description="CSV, XLSX, JSON"
          />
          <UploadInfoCard
            icon={Shield}
            title="Data Security"
            description="Encrypted in transit & at rest"
          />
          <UploadInfoCard
            icon={Zap}
            title="Fast Processing"
            description="Up to 1M rows supported"
          />
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
