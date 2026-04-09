import { FileSpreadsheet } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

type FileSummaryCardProps = {
  fileName: string;
  details: string;
  badgeLabel: string;
};

export function FileSummaryCard({
  fileName,
  details,
  badgeLabel,
}: FileSummaryCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-5 py-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white">
        <FileSpreadsheet className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm font-medium text-slate-900">
          {fileName}
        </p>
        <p className="text-xs text-slate-500">{details}</p>
      </div>
      <StatusBadge label={badgeLabel} tone="success" />
    </div>
  );
}
