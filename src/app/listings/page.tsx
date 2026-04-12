'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getToken } from '@/lib/auth';

const GAMES = ['All', 'Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Fortnite', 'Apex Legends', 'Rocket League', 'FIFA', 'Other'];
const REGIONS = ['All', 'NA', 'EU', 'APAC', 'SA', 'ME', 'OCE'];

interface Listing {
  id: string;
  game: string;
  roleNeeded: string;
  rankRequired: string;
  region: string;
  description: string | null;
  status: string;
  createdAt: string;
  team: {
    teamName: string;
    logoUrl: string | null;
    user: { username: string; avatar: string | null };
  };
  _count: { applications: number };
}

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ game: '', region: '', roleNeeded: '' });
  const isLoggedIn = !!getToken();

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.game && filters.game !== 'All') params.append('game', filters.game);
      if (filters.region && filters.region !== 'All') params.append('region', filters.region);
      if (filters.roleNeeded) params.append('roleNeeded', filters.roleNeeded);

      const res = await api.get(`/listings?${params.toString()}`);
      setListings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Open Listings</h1>
            <p className="text-gray-400">Find your next team</p>
          </div>
          <div className="flex gap-3">
            {isLoggedIn && (
              <button
                onClick={() => router.push('/listings/create')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition text-sm font-medium"
              >
                + Post Listing
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-lg transition text-sm"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Game</label>
            <select name="game" value={filters.game} onChange={handleFilterChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none transition">
              {GAMES.map(g => <option key={g} value={g === 'All' ? '' : g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Region</label>
            <select name="region" value={filters.region} onChange={handleFilterChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none transition">
              {REGIONS.map(r => <option key={r} value={r === 'All' ? '' : r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <input name="roleNeeded" value={filters.roleNeeded} onChange={handleFilterChange}
              placeholder="e.g. Entry Fragger"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none transition" />
          </div>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-2xl mb-2">No listings found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {listings.map(listing => (
              <div
                key={listing.id}
                onClick={() => router.push(`/listings/${listing.id}`)}
                className="bg-gray-900 border border-gray-800 hover:border-purple-500 rounded-xl p-6 cursor-pointer transition group"
              >
                {/* Team info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-lg">
                    {listing.team.user.avatar
                      ? <img src={listing.team.user.avatar} alt="" className="w-full h-full object-cover" />
                      : '🏆'
                    }
                  </div>
                  <div>
                    <p className="font-semibold group-hover:text-purple-400 transition">{listing.team.teamName}</p>
                    <p className="text-xs text-gray-500">{listing.team.user.username}</p>
                  </div>
                  <span className="ml-auto text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">Open</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-purple-900 text-purple-300 px-3 py-1 rounded-full">{listing.game}</span>
                  <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">{listing.roleNeeded}</span>
                  <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">{listing.rankRequired}</span>
                  <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">{listing.region}</span>
                </div>

                {/* Description */}
                {listing.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{listing.description}</p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{listing._count.applications} applicant{listing._count.applications !== 1 ? 's' : ''}</span>
                  <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}