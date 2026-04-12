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
  }, []);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Welcome to the Platform</h1>
        <p className="text-gray-400 text-lg">First, tell us who you are</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button
          onClick={() => router.push('/onboarding/player')}
          className="bg-gray-900 border border-gray-800 hover:border-purple-500 rounded-2xl p-8 text-left transition group"
        >
          <div className="text-4xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition">I'm a Player</h2>
          <p className="text-gray-400">Looking for a team to compete with. Set up your player profile and apply to open positions.</p>
        </button>

        <button
          onClick={() => router.push('/onboarding/team')}
          className="bg-gray-900 border border-gray-800 hover:border-purple-500 rounded-2xl p-8 text-left transition group"
        >
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition">I'm a Team</h2>
          <p className="text-gray-400">Looking for talented players to join your roster. Post listings and review applicants.</p>
        </button>
      </div>
    </main>
  );
}