'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import axios from 'axios';
import { fetchPlatformConfig, type PlatformConfig } from '@/lib/platform-config';

export default function PlayerOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<PlatformConfig>({ regions: [], gameConfigs: [] });
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

  const games = config.gameConfigs.map((g) => g.name);
  const ranks = config.gameConfigs.find((g) => g.name === form.game)?.ranks || [];
  const roles = config.gameConfigs.find((g) => g.name === form.game)?.roles || [];
  const regions = config.regions;

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

  useEffect(() => {
    fetchPlatformConfig().then(setConfig);
  }, []);

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
          <h1 className="text-3xl font-bold mb-2">Set Up Your Player Profile</h1>
          <p className="text-slate-400">This is what teams will see when you apply</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
              {avatarPreview
                ? <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                : <span className="text-3xl">👤</span>
              }
            </div>
            <div>
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition text-sm">
                Upload Photo
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <p className="text-slate-500 text-xs mt-1">Optional. JPG, PNG up to 5MB</p>
            </div>
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

          {/* Rank */}
          <div>
            <label className="block text-sm font-medium mb-2">Rank *</label>
            <select name="rank" value={form.rank} onChange={handleChange} required disabled={!form.game}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition disabled:opacity-50">
              <option value="">Select your rank</option>
              {ranks.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">Role *</label>
            <select name="role" value={form.role} onChange={handleChange} required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition">
              <option value="">Select role</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
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
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
              placeholder="Tell teams about yourself, your playstyle, achievements..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition resize-none" />
          </div>

          {/* Highlight URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Highlight / VOD URL</label>
            <input type="url" name="highlightUrl" value={form.highlightUrl} onChange={handleChange}
              placeholder="https://youtube.com/..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition" />
          </div>

          {/* Available */}
          <div className="flex items-center gap-3">
            <input type="checkbox" name="available" id="available" checked={form.available} onChange={handleChange}
              className="w-4 h-4 accent-cyan-500" />
            <label htmlFor="available" className="text-sm">I am currently available to join a team</label>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition">
            {loading ? 'Creating Profile...' : 'Create Player Profile'}
          </button>
        </form>
      </div>
    </main>
  );
}