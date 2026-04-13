'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getToken } from '@/lib/auth';
import { gameThemeClass } from '@/lib/game-theme';

interface Listing {
  id: string;
  type: 'looking_for_player' | 'looking_for_team';
  game: string;
  roleNeeded: string;
  rankRequired: string;
  region: string;
  description: string | null;
  createdAt: string;
  team: { teamName: string; user: { username: string; avatar: string | null } } | null;
  player: { user: { username: string; avatar: string | null } } | null;
}

export default function ListingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState({ q: '', game: '', region: '', type: '' });
  const isLoggedIn = !!getToken();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const query = new URLSearchParams();
        if (filters.q) query.append('q', filters.q);
        if (filters.game) query.append('game', filters.game);
        if (filters.region) query.append('region', filters.region);
        if (filters.type) query.append('type', filters.type);
        const res = await api.get(`/listings?${query.toString()}`);
        setListings(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [filters]);

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Open Listings</h1>
            <p className="text-slate-400">Visible for both players and teams</p>
          </div>
          {isLoggedIn && (
            <button
              onClick={() => router.push('/listings/create')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Post Listing
            </button>
          )}
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <input
            value={filters.q}
            onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
            placeholder="Search role, rank, team, player..."
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
          />
          <input
            value={filters.game}
            onChange={(e) => setFilters((prev) => ({ ...prev, game: e.target.value }))}
            placeholder="Filter by game"
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
          />
          <input
            value={filters.region}
            onChange={(e) => setFilters((prev) => ({ ...prev, region: e.target.value }))}
            placeholder="Filter by region"
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
          >
            <option value="">All types</option>
            <option value="looking_for_player">Team looking for player</option>
            <option value="looking_for_team">Player looking for team</option>
          </select>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading listings...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((listing) => {
              const isTeamListing = listing.type === 'looking_for_player';
              const poster = isTeamListing ? listing.team?.teamName : listing.player?.user.username;
              return (
                <button
                  key={listing.id}
                  onClick={() => router.push(`/listings/${listing.id}`)}
                  className="surface-hover text-left bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-xl p-5"
                >
                  <p className="text-xs text-cyan-300 mb-2">
                    {isTeamListing ? 'Team looking for player' : 'Player looking for team'}
                  </p>
                  <h3 className="font-semibold text-lg mb-2">{poster}</h3>
                  <div className="flex flex-wrap gap-2 text-xs mb-3">
                    <span className={`px-2 py-1 rounded ${gameThemeClass(listing.game)}`}>{listing.game}</span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">{listing.roleNeeded}</span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">{listing.rankRequired}</span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">{listing.region}</span>
                  </div>
                  {listing.description && (
                    <p className="text-sm text-slate-400 line-clamp-2 mb-2">{listing.description}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    Posted {new Date(listing.createdAt).toLocaleDateString()}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}