import { Upload } from "lucide-react";
import { Button } from "../ui/Button";

type FileDropZoneProps = {
  title?: string;
  description?: string;
  browseLabel?: string;
};

export function FileDropZone({
  title = "Drag & drop your file here",
  description = "or click to browse. Supports CSV, XLSX, JSON (max 50MB)",
  browseLabel = "Browse Files",
}: FileDropZoneProps) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-6 text-center transition-colors hover:border-slate-400 hover:bg-slate-50">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        <Upload className="h-8 w-8 text-slate-700" />
      </div>
      <div className="space-y-2">
        <p className="text-xl font-semibold text-slate-900">{title}</p>
        <p className="max-w-md text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <Button>{browseLabel}</Button>
    </div>
  );
}
