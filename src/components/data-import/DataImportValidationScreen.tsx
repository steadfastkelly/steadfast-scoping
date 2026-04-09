import { Button } from "../ui/Button";
import { FileSummaryCard } from "../ui/FileSummaryCard";
import { StepIndicator } from "../ui/StepIndicator";
import { ValidationCheckRow } from "../ui/ValidationCheckRow";
import { AppShell } from "../app-shell/AppShell";
import { DataImportPageHeader } from "./DataImportPageHeader";

const validationRows = [
  {
    title: "Column headers match",
    description: "All 12 required columns were found in the file",
    tone: "success" as const,
  },
  {
    title: "Data types validated",
    description: "All columns contain the expected data types",
    tone: "success" as const,
  },
  {
    title: "No duplicate records",
    description: "0 duplicate entries detected across 24,851 rows",
    tone: "success" as const,
  },
  {
    title: "Required fields populated",
    description: "All required fields contain values",
    tone: "success" as const,
  },
  {
    title: "Email format validation",
    description: "23 rows contain potentially invalid email addresses",
    tone: "warning" as const,
  },
];

type DataImportValidationScreenProps = {
  onBack?: () => void;
  onSkipWarnings?: () => void;
  onBeginImport?: () => void;
};

export function DataImportValidationScreen({
  onBack,
  onSkipWarnings,
  onBeginImport,
}: DataImportValidationScreenProps) {
  return (
    <AppShell>
      <div className="flex flex-col gap-7">
        <DataImportPageHeader
          title="Validate Import"
          description="Review validation results before completing the import"
        />

        <StepIndicator
          steps={[
            { label: "Upload", state: "complete" },
            { label: "Validate", state: "current" },
            { label: "Complete", state: "upcoming" },
          ]}
        />

        <FileSummaryCard
          fileName="customer_data_2024.csv"
          details="24,851 rows · 12 columns · 4.2 MB"
          badgeLabel="Uploaded"
        />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Validation Results
            </h2>
            <span className="text-sm text-slate-500">4 of 5 checks passed</span>
          </div>

          {validationRows.map((row) => (
            <ValidationCheckRow
              key={row.title}
              title={row.title}
              description={row.description}
              tone={row.tone}
            />
          ))}
        </section>

        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onSkipWarnings}>
              Skip Warnings
            </Button>
            <Button onClick={onBeginImport}>Begin Import</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
