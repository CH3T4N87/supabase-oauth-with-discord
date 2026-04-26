import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-16">
      <section className="max-w-6xl mx-auto rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-10 md:p-16 shadow-2xl shadow-cyan-950/20">
        <p className="uppercase tracking-[0.2em] text-xs text-cyan-300 mb-4">Competitive Recruitment Network</p>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
          Build Winning Rosters.<br />
          Sign Elite Players.
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mb-8">
          A premium esports recruitment hub for teams and players. Discover talent, review applications, open rooms, and close rosters with a professional workflow.
        </p>
        <div className="flex flex-wrap gap-3 mb-10">
          <Link href="/listings" className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-7 py-3 rounded-lg transition">
            Enter Marketplace
          </Link>
          <Link href="/profiles" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-7 py-3 rounded-lg transition">
            Browse Profiles
          </Link>
          <Link href="/dashboard" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-7 py-3 rounded-lg transition">
            Open Dashboard
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs text-slate-400 mb-1">Recruitment</p>
            <h3 className="font-semibold mb-1">Dual-Sided Listings</h3>
            <p className="text-sm text-slate-400">Teams and players can both publish open opportunities.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs text-slate-400 mb-1">Decisioning</p>
            <h3 className="font-semibold mb-1">Structured Status Flow</h3>
            <p className="text-sm text-slate-400">Track pending, under-review, accepted, and rejected pipelines.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs text-slate-400 mb-1">Communication</p>
            <h3 className="font-semibold mb-1">Private Team Rooms</h3>
            <p className="text-sm text-slate-400">Persisted room messages for direct team-player coordination.</p>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Free Fire', 'Free Fire Max', 'BGMI', 'Dota 2'].map((game) => (
          <div key={game} className="rounded-xl border border-slate-800 p-4 bg-slate-900/60">
            <p className="text-sm text-slate-400">Top Queue</p>
            <p className="font-semibold">{game}</p>
          </div>
        ))}
      </section>
      <div className="max-w-6xl mx-auto mt-8">
        <Link href="/login" className="text-cyan-300 hover:text-cyan-200 text-sm">Need to start? Sign in with Discord →</Link>
      </div>
    </main>
  );
}