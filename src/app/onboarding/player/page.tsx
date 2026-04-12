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

export default function PlayerOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [form, setForm] = useState({
    game: '',
    rank: '',
    role: '',
    region: '',
    bio: '',
    highlightUrl: '',
    available: true
  });

  const ranks = RANKS[form.game] || RANKS['Default'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      ...(name === 'game' ? { rank: '' } : {})
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/profile/player', form);

      if (avatar) {
        const formData = new FormData();
        formData.append('avatar', avatar);
        await api.post('/upload/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

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
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition">
            ← Back
          </button>
          <h1 className="text-3xl font-bold mb-2">Set Up Your Player Profile</h1>
          <p className="text-gray-400">This is what teams will see when you apply</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden flex items-center justify-center">
              {avatarPreview
                ? <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                : <span className="text-3xl">👤</span>
              }
            </div>
            <div>
              <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition text-sm">
                Upload Photo
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <p className="text-gray-500 text-xs mt-1">Optional. JPG, PNG up to 5MB</p>
            </div>
          </div>

          {/* Game */}
          <div>
            <label className="block text-sm font-medium mb-2">Game *</label>
            <select name="game" value={form.game} onChange={handleChange} required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 outline-none transition">
              <option value="">Select a game</option>
              {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Rank */}
          <div>
            <label className="block text-sm font-medium mb-2">Rank *</label>
            <select name="rank" value={form.rank} onChange={handleChange} required disabled={!form.game}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 outline-none transition disabled:opacity-50">
              <option value="">Select your rank</option>
              {ranks.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">Role *</label>
            <input type="text" name="role" value={form.role} onChange={handleChange} required
              placeholder="e.g. Entry Fragger, Support, Jungler"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 outline-none transition" />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium mb-2">Region *</label>
            <select name="region" value={form.region} onChange={handleChange} required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 outline-none transition">
              <option value="">Select your region</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
              placeholder="Tell teams about yourself, your playstyle, achievements..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 outline-none transition resize-none" />
          </div>

          {/* Highlight URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Highlight / VOD URL</label>
            <input type="url" name="highlightUrl" value={form.highlightUrl} onChange={handleChange}
              placeholder="https://youtube.com/..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 outline-none transition" />
          </div>

          {/* Available */}
          <div className="flex items-center gap-3">
            <input type="checkbox" name="available" id="available" checked={form.available} onChange={handleChange}
              className="w-4 h-4 accent-purple-500" />
            <label htmlFor="available" className="text-sm">I am currently available to join a team</label>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition">
            {loading ? 'Creating Profile...' : 'Create Player Profile'}
          </button>
        </form>
      </div>
    </main>
  );
}