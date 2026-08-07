import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon?: LucideIcon;
  badge?: string;
  trend?: string;
  color?: "cyan" | "emerald" | "amber" | "purple";
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  badge,
  trend,
  color = "cyan",
}: StatCardProps) {
  const colorStyles = {
    cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-950/20",
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-950/20",
    amber: "text-amber-400 border-amber-500/20 bg-amber-950/20",
    purple: "text-purple-400 border-purple-500/20 bg-purple-950/20",
  };

  const iconBgStyles = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-6 hover:border-cyan-500/40 group">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>

        {Icon && (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${iconBgStyles[color]} transition-transform group-hover:scale-110`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h2 className={`text-4xl font-extrabold tracking-tight ${colorStyles[color].split(" ")[0]}`}>
          {value}
        </h2>

        {badge && (
          <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-400">{description}</p>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}