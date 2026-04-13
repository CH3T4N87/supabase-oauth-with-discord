'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import axios from 'axios';
import { fetchPlatformConfig, type PlatformConfig } from '@/lib/platform-config';

export default function CreateListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileType, setProfileType] = useState<'team' | 'player' | null>(null);
  const [config, setConfig] = useState<PlatformConfig>({ regions: [], gameConfigs: [] });
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    type: 'looking_for_player',
    game: '',
    roleNeeded: '',
    rankRequired: '',
    region: '',
    description: ''
  });

  const games = config.gameConfigs.map((g) => g.name);
  const ranks = config.gameConfigs.find((g) => g.name === form.game)?.ranks || [];
  const regions = config.regions;
  const isTeamListing = form.type === 'looking_for_player';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
      ...(e.target.name === 'game' ? { rankRequired: '' } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/listings', form);
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

  useEffect(() => {
    fetchPlatformConfig().then(setConfig);
    api.get('/auth/me')
      .then((res) => {
        const user = res.data;
        if (user?.teamProfile) {
          setProfileType('team');
          setForm((prev) => ({ ...prev, type: 'looking_for_player' }));
          return;
        }
        if (user?.playerProfile) {
          setProfileType('player');
          setForm((prev) => ({ ...prev, type: 'looking_for_team' }));
        }
      })
      .catch(() => {
        setProfileType(null);
      });
  }, []);

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <button onClick={() => router.back()}
            className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition">
            ← Back
          </button>
          <h1 className="text-3xl font-bold mb-2">Post a Listing</h1>
          <p className="text-slate-400">
            {profileType === 'player'
              ? 'Your listing will be posted as "looking for team".'
              : 'Your listing will be posted as "looking for player".'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="type" value={form.type} />

          <div>
            <label className="block text-sm font-medium mb-2">Game *</label>
            <select name="game" value={form.game} onChange={handleChange} required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition">
              <option value="">Select a game</option>
              {games.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {isTeamListing ? 'Role Needed *' : 'Your Main Role *'}
            </label>
            <input type="text" name="roleNeeded" value={form.roleNeeded} onChange={handleChange} required
              placeholder={isTeamListing ? 'e.g. Entry Fragger, Support, Jungler' : 'e.g. IGL, Duelist, Jungler'}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {isTeamListing ? 'Minimum Rank Required *' : 'Current Rank *'}
            </label>
            <select name="rankRequired" value={form.rankRequired} onChange={handleChange} required disabled={!form.game}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition disabled:opacity-50">
              <option value="">{isTeamListing ? 'Select minimum rank' : 'Select your current rank'}</option>
              {ranks.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Region *</label>
            <select name="region" value={form.region} onChange={handleChange} required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition">
              <option value="">Select region</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5}
              placeholder={isTeamListing
                ? "Describe what you're looking for - schedule, playstyle, tryout process..."
                : "Describe what you're looking for in a team - goals, playstyle, availability..."}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition resize-none" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition">
            {loading ? 'Posting...' : 'Publish Listing'}
          </button>
        </form>
      </div>
    </main>
  );
}