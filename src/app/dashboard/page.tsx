'use client';

import { useEffect, useState } from 'react';
import { getToken, logout } from '@/lib/auth';
import api from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      logout();
      return;
    }

    api.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error('Failed to fetch user:', err);
        setLoading(false);
      })
      .finally(() => setLoading(false));
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
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md text-center">
        {user?.avatar && (
          <img
            src={user.avatar}
            alt={user?.username || 'User'}
            className="w-20 h-20 rounded-full mx-auto mb-4"
          />
        )}
        <h1 className="text-2xl font-bold mb-1">
          Welcome, {user?.username || user?.email || 'Player'}!
        </h1>
        <p className="text-gray-400 mb-6">{user?.email}</p>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </main>
  );
}