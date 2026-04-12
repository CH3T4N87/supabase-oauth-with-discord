'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '@/lib/auth';
import api from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  playerProfile: any;
  teamProfile: any;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }

    api.get('/auth/me')
      .then((res) => {
        const userData = res.data;
        setUser(userData);
        if (!userData.playerProfile && !userData.teamProfile) {
          router.push('/onboarding');
        }
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const isPlayer = !!user?.playerProfile;
  const profile = user?.playerProfile || user?.teamProfile;

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <img
              src={profile?.avatarUrl || user?.avatar || ''}
              alt={user?.username}
              className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
            />
            <div>
              <h1 className="text-2xl font-bold">{user?.username}</h1>
              <p className="text-gray-400">{user?.email}</p>
              <span className={`text-xs px-3 py-1 rounded-full font-medium mt-1 inline-block ${isPlayer ? 'bg-purple-900 text-purple-300' : 'bg-amber-900 text-amber-300'}`}>
                {isPlayer ? 'Player' : 'Team'}
              </span>
            </div>
          </div>
          <button onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm">
            Logout
          </button>
        </div>

        {/* Profile Summary */}
        {profile && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">
            <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              {isPlayer ? (
                <>
                  <div><p className="text-gray-400 text-sm">Game</p><p className="font-medium">{profile.game}</p></div>
                  <div><p className="text-gray-400 text-sm">Rank</p><p className="font-medium">{profile.rank}</p></div>
                  <div><p className="text-gray-400 text-sm">Role</p><p className="font-medium">{profile.role}</p></div>
                  <div><p className="text-gray-400 text-sm">Region</p><p className="font-medium">{profile.region}</p></div>
                </>
              ) : (
                <>
                  <div><p className="text-gray-400 text-sm">Team</p><p className="font-medium">{profile.teamName}</p></div>
                  <div><p className="text-gray-400 text-sm">Game</p><p className="font-medium">{profile.game}</p></div>
                  <div><p className="text-gray-400 text-sm">Region</p><p className="font-medium">{profile.region}</p></div>
                </>
              )}
            </div>
            <div className="mt-4 flex gap-3">
              <a href={`/profile/${user?.id}`} target="_blank"
                className="text-purple-400 hover:text-purple-300 text-sm transition">
                View Public Profile →
              </a>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          {isPlayer ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Browse Listings</h3>
              <p className="text-gray-400 text-sm mb-4">Find teams looking for your role</p>
              <button
                onClick={() => router.push('/listings')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition">
                Browse Now
              </button>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Post a Listing</h3>
              <p className="text-gray-400 text-sm mb-4">Find players for your team</p>
              <button
                onClick={() => router.push('/listings/create')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition">
                Post Now
              </button>
            </div>
          )}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">
              {isPlayer ? 'My Applications' : 'Manage Applicants'}
            </h3>
            <p className="text-gray-400 text-sm mb-4">Track your activity</p>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition">
              Coming in Phase 4
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}