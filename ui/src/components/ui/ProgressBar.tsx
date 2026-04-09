type ProgressBarProps = {
  label: string;
  value: number;
};

export function ProgressBar({ label, value }: ProgressBarProps) {
  const boundedValue = Math.max(0, Math.min(100, value));

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-900">{label}</span>
        <span className="font-mono text-slate-500">{boundedValue}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-teal-600 transition-[width]"
          style={{ width: `${boundedValue}%` }}
        />
      </div>
    </div>
  );
}
