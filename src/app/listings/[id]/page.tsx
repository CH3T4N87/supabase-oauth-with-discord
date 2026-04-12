'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { getToken } from '@/lib/auth';

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
    id: string;
    teamName: string;
    bio: string | null;
    discordUrl: string | null;
    user: { id: string; username: string; avatar: string | null };
  };
  _count: { applications: number };
}

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [pitch, setPitch] = useState('');
  const [error, setError] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const isLoggedIn = !!getToken();

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => setListing(res.data))
      .catch(() => router.push('/listings'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { router.push('/login'); return; }

    setApplying(true);
    setError('');

    try {
      await api.post('/applications', { listingId: id, pitch });
      setApplied(true);
      setShowApplyForm(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!listing) return null;

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">

        <button onClick={() => router.push('/listings')}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition">
          ← Back to Listings
        </button>

        {/* Team Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-2xl">
              {listing.team.user.avatar
                ? <img src={listing.team.user.avatar} alt="" className="w-full h-full object-cover" />
                : '🏆'
              }
            </div>
            <div>
              <h1 className="text-2xl font-bold">{listing.team.teamName}</h1>
              <p className="text-gray-400 text-sm">{listing.team.user.username}</p>
            </div>
            <span className={`ml-auto text-xs px-3 py-1 rounded-full font-medium ${listing.status === 'open' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
              {listing.status}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm bg-purple-900 text-purple-300 px-3 py-1 rounded-full">{listing.game}</span>
            <span className="text-sm bg-gray-800 text-gray-300 px-3 py-1 rounded-full">🎯 {listing.roleNeeded}</span>
            <span className="text-sm bg-gray-800 text-gray-300 px-3 py-1 rounded-full">⭐ {listing.rankRequired}+</span>
            <span className="text-sm bg-gray-800 text-gray-300 px-3 py-1 rounded-full">🌍 {listing.region}</span>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-400 mb-2">About this listing</h2>
              <p className="text-gray-300 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Team Bio */}
          {listing.team.bio && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-400 mb-2">About the team</h2>
              <p className="text-gray-300 leading-relaxed">{listing.team.bio}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{listing._count.applications} applicant{listing._count.applications !== 1 ? 's' : ''}</span>
            <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Apply Section */}
        {listing.status === 'open' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            {applied ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-xl font-bold mb-2">Application Sent!</h2>
                <p className="text-gray-400">The team will review your profile and get back to you.</p>
              </div>
            ) : showApplyForm ? (
              <form onSubmit={handleApply}>
                <h2 className="text-xl font-bold mb-2">Apply to {listing.team.teamName}</h2>
                <p className="text-gray-400 text-sm mb-5">Write a short pitch — why are you the right fit?</p>

                <textarea
                  value={pitch}
                  onChange={e => setPitch(e.target.value)}
                  rows={5}
                  maxLength={500}
                  placeholder="Tell the team about yourself, your experience, your availability..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 outline-none transition resize-none mb-2"
                />
                <p className="text-xs text-gray-500 mb-5 text-right">{pitch.length}/500</p>

                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowApplyForm(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={applying}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition">
                    {applying ? 'Sending...' : 'Send Application'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Interested in joining?</h2>
                <p className="text-gray-400 text-sm mb-6">
                  {isLoggedIn ? 'Apply now and let the team know why you\'re the right fit.' : 'Sign in to apply for this position.'}
                </p>
                <button
                  onClick={() => isLoggedIn ? setShowApplyForm(true) : router.push('/login')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition">
                  {isLoggedIn ? 'Apply Now' : 'Sign in to Apply'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}