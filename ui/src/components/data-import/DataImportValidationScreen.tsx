import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
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

export function DataImportValidationScreen() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
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

        <Card className="space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Selected file</p>
            <h2 className="text-xl font-semibold text-slate-900">
              Review your import before processing
            </h2>
          </div>
          <FileSummaryCard
            fileName="customer_data_2024.csv"
            details="24,851 rows · 12 columns · 4.2 MB"
            badgeLabel="Uploaded"
          />
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
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
        </Card>

        <Card className="flex items-center justify-between gap-4 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-900">
              Validation complete
            </p>
            <p className="text-sm text-slate-500">
              Resolve warnings or continue to import the validated records.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary">Back</Button>
            <Button variant="secondary">Skip Warnings</Button>
            <Button>Begin Import</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
