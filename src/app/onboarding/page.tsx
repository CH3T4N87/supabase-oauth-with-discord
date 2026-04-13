'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/auth';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then((user) => {
      if (user.playerProfile) return router.push('/dashboard');
      if (user.teamProfile) return router.push('/dashboard');
      setLoading(false);
    }).catch(() => router.push('/login'));
  }, [router]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Welcome to the Platform</h1>
        <p className="text-slate-400 text-lg">First, tell us who you are</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button
          onClick={() => router.push('/onboarding/player')}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-2xl p-8 text-left transition group"
        >
          <div className="text-4xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:text-cyan-400 transition">I&apos;m a Player</h2>
          <p className="text-slate-400">Looking for a team to compete with. Set up your player profile and apply to open positions.</p>
        </button>

        <button
          onClick={() => router.push('/onboarding/team')}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-2xl p-8 text-left transition group"
        >
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:text-cyan-400 transition">I&apos;m a Team</h2>
          <p className="text-slate-400">Looking for talented players to join your roster. Post listings and review applicants.</p>
        </button>
      </div>
    </main>
  );
}