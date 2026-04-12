'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const GAMES = ['Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Fortnite', 'Apex Legends', 'Rocket League', 'FIFA', 'Other'];
const REGIONS = ['NA', 'EU', 'APAC', 'SA', 'ME', 'OCE'];
const RANKS: Record<string, string[]> = {
  'Valorant': ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'],
  'CS2': ['Silver', 'Gold Nova', 'MG', 'MGE', 'DMG', 'LE', 'LEM', 'Supreme', 'Global'],
  'League of Legends': ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'],
  'Default': ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Professional']
};

export default function CreateListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    game: '',
    roleNeeded: '',
    rankRequired: '',
    region: '',
    description: ''
  });

  const ranks = RANKS[form.game] || RANKS['Default'];

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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <button onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition">
            ← Back
          </button>
          <h1 className="text-3xl font-bold mb-2">Post a Listing</h1>
          <p className="text-gray-400">Tell players what you're looking for</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-medium mb-2">Game *</label>
            <select name="game" value={form.game} onChange={handleChange} required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 outline-none transition">
              <option value="">Select a game</option>
              {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role Needed *</label>
            <input type="text" name="roleNeeded" value={form.roleNeeded} onChange={handleChange} required
              placeholder="e.g. Entry Fragger, Support, Jungler"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 outline-none transition" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Minimum Rank Required *</label>
            <select name="rankRequired" value={form.rankRequired} onChange={handleChange} required disabled={!form.game}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 outline-none transition disabled:opacity-50">
              <option value="">Select minimum rank</option>
              {ranks.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Region *</label>
            <select name="region" value={form.region} onChange={handleChange} required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 outline-none transition">
              <option value="">Select region</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5}
              placeholder="Describe what you're looking for — schedule, playstyle, tryout process..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 outline-none transition resize-none" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition">
            {loading ? 'Posting...' : 'Post Listing'}
          </button>
        </form>
      </div>
    </main>
  );
}