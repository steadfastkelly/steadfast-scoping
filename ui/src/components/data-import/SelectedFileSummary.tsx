import { FileSpreadsheet } from "lucide-react";
import { StatusBadge } from "../ui/StatusBadge";
import { Card } from "../ui/Card";

type SelectedFileSummaryProps = {
  fileName: string;
  details: string;
};

export function SelectedFileSummary({
  fileName,
  details,
}: SelectedFileSummaryProps) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white">
        <FileSpreadsheet className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm font-medium text-slate-900">
          {fileName}
        </p>
        <p className="text-xs text-slate-500">{details}</p>
      </div>
      <StatusBadge label="Uploaded" tone="success" />
    </Card>
  );
}
