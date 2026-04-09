import { Upload } from "lucide-react";
import { Button } from "../ui/Button";

type FileDropZoneProps = {
  title?: string;
  description?: string;
  browseLabel?: string;
  onBrowse?: () => void;
};

export function FileDropZone({
  title = "Drag & drop your file here",
  description = "or click to browse. Supports CSV, XLSX, JSON (max 50MB)",
  browseLabel = "Browse Files",
  onBrowse,
}: FileDropZoneProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-8 py-10 text-center">
      <Upload className="h-12 w-12 text-teal-600" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <Button onClick={onBrowse}>{browseLabel}</Button>
    </div>
  );
}
