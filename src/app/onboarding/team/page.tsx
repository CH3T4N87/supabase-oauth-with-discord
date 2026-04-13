'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import axios from 'axios';
import { fetchPlatformConfig, type PlatformConfig } from '@/lib/platform-config';

export default function TeamOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<PlatformConfig>({ regions: [], gameConfigs: [] });
  const [form, setForm] = useState({
    teamName: '',
    game: '',
    region: '',
    bio: '',
    discordUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    fetchPlatformConfig().then(setConfig);
  }, []);

  const games = config.gameConfigs.map((g) => g.name);
  const regions = config.regions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/profile/team', form);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError((err.response?.data as { error?: string } | undefined)?.error || 'Something went wrong');
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition">
            ← Back
          </button>
          <h1 className="text-3xl font-bold mb-2">Set Up Your Team Profile</h1>
          <p className="text-slate-400">This is what players will see on your listings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Team Name *</label>
            <input type="text" name="teamName" value={form.teamName} onChange={handleChange} required
              placeholder="e.g. Team Liquid, Cloud9"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition" />
          </div>

          {/* Game */}
          <div>
            <label className="block text-sm font-medium mb-2">Game *</label>
            <select name="game" value={form.game} onChange={handleChange} required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition">
              <option value="">Select a game</option>
              {games.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium mb-2">Region *</label>
            <select name="region" value={form.region} onChange={handleChange} required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition">
              <option value="">Select your region</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">About the Team</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
              placeholder="Tell players about your team, your goals, your schedule..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition resize-none" />
          </div>

          {/* Discord */}
          <div>
            <label className="block text-sm font-medium mb-2">Team Discord URL</label>
            <input type="url" name="discordUrl" value={form.discordUrl} onChange={handleChange}
              placeholder="https://discord.gg/..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition">
            {loading ? 'Creating Profile...' : 'Create Team Profile'}
          </button>
        </form>
      </div>
    </main>
  );
}