'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { getToken } from '@/lib/auth';
import axios from 'axios';
import { gameThemeClass } from '@/lib/game-theme';

interface Listing {
  id: string;
  type: string;
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
  } | null;
  player: {
    id: string;
    bio: string | null;
    user: { id: string; username: string; avatar: string | null };
  } | null;
  _count: { applications: number };
}

interface Me {
  id: string;
  playerProfile: { id: string } | null;
  teamProfile: { id: string } | null;
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
  const [me, setMe] = useState<Me | null>(null);
  const isLoggedIn = !!getToken();

  // Get current user ID from token (you'll need to implement this)
  const getCurrentUserId = () => {
    const token = getToken();
    if (!token) return null;
    // Decode JWT and get user ID
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.id || payload.userId;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();
  const isOwnListing = listing && (
    (listing.type === 'looking_for_player' && listing.team?.user.id === currentUserId) ||
    (listing.type === 'looking_for_team' && listing.player?.user.id === currentUserId)
  );

  useEffect(() => {
    Promise.all([
      api.get(`/listings/${id}`),
      isLoggedIn ? api.get('/auth/me') : Promise.resolve({ data: null })
    ])
      .then(([listingRes, meRes]) => {
        setListing(listingRes.data);
        setMe(meRes.data);
      })
      .catch(() => router.push('/listings'))
      .finally(() => setLoading(false));
  }, [id, router, isLoggedIn]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { 
      router.push('/login'); 
      return; 
    }

    setApplying(true);
    setError('');

    try {
      const isTeamListing = listing?.type === 'looking_for_player';
      if (isTeamListing) {
        await api.post('/applications', { listingId: id, pitch });
      } else {
        await api.post('/team-requests', { listingId: id, message: pitch });
      }
      setApplied(true);
      setShowApplyForm(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError((err.response?.data as { error?: string } | undefined)?.error || 'Something went wrong');
      } else {
        setError('Something went wrong');
      }
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

  const isTeamListing = listing.type === 'looking_for_player';
  const isPlayerUser = !!me?.playerProfile;
  const isTeamUser = !!me?.teamProfile;
  const canTakeAction = isLoggedIn && (
    (isTeamListing && isPlayerUser) || (!isTeamListing && isTeamUser)
  );
  const actionTitle = isTeamListing ? 'Apply to Team' : 'Send Request to Player';
  const posterName = isTeamListing ? listing.team?.teamName : listing.player?.user?.username;
  const posterAvatar = isTeamListing ? listing.team?.user?.avatar : listing.player?.user?.avatar;
  const posterBio = isTeamListing ? listing.team?.bio : listing.player?.bio;
  const posterUsername = isTeamListing ? listing.team?.user?.username : listing.player?.user?.username;

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">

        <button 
          onClick={() => router.push('/listings')}
          className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition"
        >
          ← Back to Listings
        </button>

        {/* Listing Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
          
          {/* Poster Info - Handles both team and player listings */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-2xl">
              {posterAvatar ? (
                <img src={posterAvatar} alt="" className="w-full h-full object-cover" />
              ) : isTeamListing ? '🏆' : '🎮'}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">
                {isTeamListing ? 'Team looking for player' : 'Player looking for team'}
              </p>
              <h1 className="text-2xl font-bold">{posterName}</h1>
              {!isTeamListing && posterUsername && (
                <p className="text-sm text-slate-500">@{posterUsername}</p>
              )}
            </div>
            <span className={`ml-auto text-xs px-3 py-1 rounded-full font-medium ${
              listing.status === 'open' 
                ? 'bg-emerald-900 text-emerald-300' 
                : 'bg-rose-900 text-rose-300'
            }`}>
              {listing.status}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`text-sm px-3 py-1 rounded-full ${gameThemeClass(listing.game)}`}>
              {listing.game}
            </span>
            <span className="text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
              🎯 {listing.roleNeeded}
            </span>
            <span className="text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
              ⭐ {listing.rankRequired}+
            </span>
            <span className="text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
              🌍 {listing.region}
            </span>
          </div>

          {/* Listing Description */}
          {listing.description && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-slate-400 mb-2">
                About this listing
              </h2>
              <p className="text-slate-300 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Poster Bio (Team Bio or Player Bio) */}
          {posterBio && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-slate-400 mb-2">
                {isTeamListing ? 'About the team' : 'About the player'}
              </h2>
              <p className="text-slate-300 leading-relaxed">{posterBio}</p>
            </div>
          )}

          {/* Team Discord (only for team listings) */}
          {isTeamListing && listing.team?.discordUrl && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-slate-400 mb-2">Discord</h2>
              <a 
                href={listing.team.discordUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition"
              >
                Join team Discord →
              </a>
            </div>
          )}

          {/* Footer Stats */}
          <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-800">
            <span>
              {listing._count.applications} applicant{listing._count.applications !== 1 ? 's' : ''}
            </span>
            <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Apply Section - Don't show if it's the user's own listing */}
        {listing.status === 'open' && !isOwnListing && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            {applied ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-xl font-bold mb-2">Application Sent!</h2>
                <p className="text-slate-400">
                  {isTeamListing 
                    ? "The team will review your profile and get back to you."
                    : "The player can accept your request to open a room."}
                </p>
              </div>
            ) : showApplyForm ? (
              <form onSubmit={handleApply}>
                <h2 className="text-xl font-bold mb-2">
                  {actionTitle} - {isTeamListing ? listing.team?.teamName : listing.player?.user?.username}
                </h2>
                <p className="text-slate-400 text-sm mb-5">
                  Write a short pitch — {isTeamListing 
                    ? "why are you the right fit for this team?" 
                    : "why should this player join your team?"}
                </p>

                <textarea
                  value={pitch}
                  onChange={e => setPitch(e.target.value)}
                  rows={5}
                  maxLength={500}
                  placeholder={isTeamListing
                    ? "Tell the team about yourself, your experience, your availability..."
                    : "Tell the player about your team, what you offer, why they should join..."}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition resize-none mb-2"
                />
                <p className="text-xs text-slate-500 mb-5 text-right">{pitch.length}/500</p>

                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowApplyForm(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={applying}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
                  >
                    {applying ? 'Sending...' : (isTeamListing ? 'Send Application' : 'Send Team Request')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">
                  {isTeamListing ? "Interested in joining?" : "Interested in recruiting this player?"}
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  {!isLoggedIn
                    ? "Sign in to continue."
                    : !canTakeAction
                    ? (isTeamListing
                      ? "Only player accounts can apply to team listings."
                      : "Only team accounts can send requests to player listings.")
                    : (isTeamListing 
                      ? "Apply now and let the team know why you're the right fit." 
                      : "Send a request. If the player accepts, a room will be created.")
                  }
                </p>
                <button
                  onClick={() => isLoggedIn && canTakeAction ? setShowApplyForm(true) : router.push('/login')}
                  disabled={isLoggedIn && !canTakeAction}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-lg transition"
                >
                  {isLoggedIn 
                    ? (isTeamListing ? "Apply Now" : "Send Team Request")
                    : "Sign in to Apply"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Own Listing Message */}
        {listing.status === 'open' && isOwnListing && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h2 className="text-xl font-bold mb-2">This is your listing</h2>
            <p className="text-slate-400">
              You can view applications in your dashboard.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-2 rounded-lg transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}

      </div>
    </main>
  );
}