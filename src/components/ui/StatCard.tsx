type StatCardProps = {
  value: string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-white px-5 py-6">
      <div className="font-mono text-3xl font-bold text-teal-600">{value}</div>
      <div className="text-center text-sm text-slate-500">{label}</div>
    </div>
  );
}
