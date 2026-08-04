type StatCardProps = {
  title: string;
  value: string;
  description: string;
};

export default function StatCard({
  title,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg transition hover:border-cyan-500">
      <p className="text-sm text-slate-400">{title}</p>

      <h2 className="mt-2 text-4xl font-bold text-cyan-400">
        {value}
      </h2>

      <p className="mt-4 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}