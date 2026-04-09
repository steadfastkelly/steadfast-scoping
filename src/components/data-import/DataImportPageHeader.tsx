type DataImportPageHeaderProps = {
  title: string;
  description: string;
};

export function DataImportPageHeader({
  title,
  description,
}: DataImportPageHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-600">{description}</p>
    </header>
  );
}
