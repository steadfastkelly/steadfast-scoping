import { Card } from "./Card";

type StatCardProps = {
  value: string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <Card className="flex flex-1 flex-col items-center gap-2 p-6">
      <div className="font-mono text-3xl font-semibold text-teal-600">
        {value}
      </div>
      <div className="text-center text-sm text-slate-500">{label}</div>
    </Card>
  );
}
