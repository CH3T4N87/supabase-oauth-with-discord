export const gameThemeClass = (game?: string) => {
  const g = (game || '').toLowerCase();
  if (g.includes('valorant')) return 'bg-rose-900/40 text-rose-200 border border-rose-700';
  if (g.includes('cs2')) return 'bg-orange-900/40 text-orange-200 border border-orange-700';
  if (g.includes('league')) return 'bg-blue-900/40 text-blue-200 border border-blue-700';
  if (g.includes('dota')) return 'bg-red-900/40 text-red-200 border border-red-700';
  if (g.includes('fortnite')) return 'bg-violet-900/40 text-violet-200 border border-violet-700';
  if (g.includes('apex')) return 'bg-amber-900/40 text-amber-200 border border-amber-700';
  if (g.includes('rocket')) return 'bg-cyan-900/40 text-cyan-200 border border-cyan-700';
  if (g.includes('fifa')) return 'bg-emerald-900/40 text-emerald-200 border border-emerald-700';
  return 'bg-slate-800 text-slate-200 border border-slate-700';
};
