import { ReactNode } from 'react';

export function AppCard({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`rounded-2xl border border-slate-800 bg-slate-900/85 ${className}`}>{children}</div>;
}

export function AppButton({
  children,
  className = '',
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const variantClass =
    variant === 'primary'
      ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
      : variant === 'danger'
      ? 'bg-rose-700 hover:bg-rose-600 text-white'
      : 'bg-slate-800 hover:bg-slate-700 text-slate-100';
  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}

export function AppBadge({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${className}`}>{children}</span>;
}

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <AppCard className="p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-2xl font-extrabold mt-1">{value}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </AppCard>
  );
}

export function MiniBarChart({
  data
}: {
  data: Array<{ label: string; value: number; colorClass?: string }>;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="grid grid-cols-[80px_1fr_40px] items-center gap-2 text-xs">
          <span className="text-slate-400">{item.label}</span>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${item.colorClass || 'bg-cyan-500'} transition-all duration-500`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="text-slate-300 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
