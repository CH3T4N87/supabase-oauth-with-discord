'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { gameThemeClass } from '@/lib/game-theme';

interface PublicProfile {
  id: string;
  username: string;
  avatar: string | null;
  playerProfile: {
    game: string;
    rank: string;
    role: string;
    region: string;
    bio?: string | null;
    currentTeam?: { teamName: string } | null;
  } | null;
  teamProfile: {
    teamName: string;
    game: string;
    region: string;
    bio?: string | null;
  } | null;
}

export default function ProfilesDirectoryPage() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | 'player' | 'team'>('all');

  useEffect(() => {
    api.get('/profile/public').then((res) => setProfiles(res.data));
  }, []);

  const filtered = useMemo(() => {
    return profiles.filter((profile) => {
      if (type === 'player' && !profile.playerProfile) return false;
      if (type === 'team' && !profile.teamProfile) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const haystack = [
        profile.username,
        profile.playerProfile?.game,
        profile.playerProfile?.role,
        profile.playerProfile?.rank,
        profile.teamProfile?.teamName,
        profile.teamProfile?.game
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [profiles, search, type]);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Profile Directory</h1>
        <p className="text-slate-400 mb-6">Browse players and teams across all games.</p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, game, role..."
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
          />
          <select value={type} onChange={(e) => setType(e.target.value as 'all' | 'player' | 'team')} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
            <option value="all">All</option>
            <option value="player">Players</option>
            <option value="team">Teams</option>
          </select>
          <div className="text-slate-400 text-sm flex items-center">{filtered.length} profile(s)</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((profile) => {
            const isPlayer = !!profile.playerProfile;
            const game = isPlayer ? profile.playerProfile?.game : profile.teamProfile?.game;
            return (
              <div key={profile.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                    {profile.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" /> : '🎮'}
                  </div>
                  <div>
                    <p className="font-semibold">{isPlayer ? profile.username : profile.teamProfile?.teamName}</p>
                    <p className="text-xs text-slate-400">{isPlayer ? 'Player' : 'Team'}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-1 rounded ${gameThemeClass(game)}`}>{game}</span>
                </div>
                {isPlayer ? (
                  <>
                    <p className="text-sm text-slate-300">{profile.playerProfile?.role} - {profile.playerProfile?.rank}</p>
                    <p className="text-sm text-slate-400">{profile.playerProfile?.region}</p>
                    <p className="text-xs text-cyan-300 mt-1">Current team: {profile.playerProfile?.currentTeam?.teamName || 'Free Agent'}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-300">{profile.teamProfile?.region}</p>
                    {profile.teamProfile?.bio && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{profile.teamProfile.bio}</p>}
                  </>
                )}
                <Link href={`/profile/${profile.id}`} className="inline-block mt-3 text-sm text-cyan-300 hover:text-cyan-200">
                  View full profile →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
