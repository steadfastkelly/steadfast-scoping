type DataImportPageHeaderProps = {
  title: string;
  description: string;
};

export function DataImportPageHeader({
  title,
  description,
}: DataImportPageHeaderProps) {
  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
        {title}
      </h1>
      <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
    </header>
  );
}
