'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '@/lib/auth';
import api from '@/lib/api';
import { AppCard, AppButton, MiniBarChart, StatCard } from '@/components/ui';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  playerProfile: {
    avatarUrl?: string | null;
    game: string;
    rank: string;
    role: string;
    region: string;
    currentTeam?: { id: string; teamName: string } | null;
  } | null;
  teamProfile: { logoUrl?: string | null; teamName: string; game: string; region: string } | null;
}

interface ApplicationItem {
  id: string;
  status: string;
  pitch?: string | null;
  player?: {
    user: { id: string; username: string; avatar: string | null };
    rank?: string;
    role?: string;
    region?: string;
    bio?: string | null;
    highlightUrl?: string | null;
  };
  joinRequest?: { id: string; status: string; message?: string | null } | null;
  listing: { game: string; roleNeeded: string; team: { teamName: string } | null };
}

interface TeamRequestItem {
  id: string;
  status: string;
  listing: { game: string; roleNeeded: string };
  message: string | null;
  team?: { teamName: string };
  player?: { user: { username: string } };
  room: { id: string } | null;
}

interface RoomItem {
  id: string;
  team: { id: string; teamName: string };
  player: { user: { username: string } };
}

interface JoinRequestItem {
  id: string;
  status: string;
  message: string | null;
  application: { listing: { game: string; roleNeeded: string } };
  team: { teamName: string };
}

interface ListingItem {
  id: string;
  game: string;
  roleNeeded: string;
  status: string;
  _count: { applications: number };
}

const statusTone: Record<string, string> = {
  pending: 'bg-amber-950 text-amber-300 border border-amber-800',
  underreview: 'bg-cyan-950 text-cyan-300 border border-cyan-800',
  accepted: 'bg-emerald-950 text-emerald-300 border border-emerald-800',
  rejected: 'bg-rose-950 text-rose-300 border border-rose-800'
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [teamRequests, setTeamRequests] = useState<TeamRequestItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [myListings, setMyListings] = useState<ListingItem[]>([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [listingApplications, setListingApplications] = useState<ApplicationItem[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadDashboard = async () => {
    const meRes = await api.get('/auth/me');
    const userData = meRes.data as User;
    setUser(userData);
    if (!userData.playerProfile && !userData.teamProfile) {
      router.push('/onboarding');
      return;
    }

    if (userData.playerProfile) {
      const [appRes, reqRes, roomRes, joinReqRes] = await Promise.all([
        api.get('/applications/my'),
        api.get('/team-requests/my'),
        api.get('/rooms/my'),
        api.get('/applications/join-requests/my')
      ]);
      setApplications(appRes.data);
      setTeamRequests(reqRes.data);
      setRooms(roomRes.data);
      setJoinRequests(joinReqRes.data);
      return;
    }

    const [reqRes, roomRes, myListingsRes] = await Promise.all([
      api.get('/team-requests/my'),
      api.get('/rooms/my'),
      api.get('/listings/my/listings')
    ]);
    setTeamRequests(reqRes.data);
    setRooms(roomRes.data);
    setMyListings(myListingsRes.data);
    if (myListingsRes.data.length > 0) {
      const firstListingId = myListingsRes.data[0].id as string;
      setSelectedListingId(firstListingId);
      const applicantsRes = await api.get(`/applications/listing/${firstListingId}`);
      setListingApplications(applicantsRes.data);
    } else {
      setSelectedListingId('');
      setListingApplications([]);
    }
  };

  const refreshListingApplications = async (listingId: string) => {
    setSelectedListingId(listingId);
    const applicantsRes = await api.get(`/applications/listing/${listingId}`);
    setListingApplications(applicantsRes.data);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard()
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const isPlayer = !!user?.playerProfile;
  const profile = user?.playerProfile || user?.teamProfile;
  const applicationStatusData = [
    { label: 'Pending', value: applications.filter((a) => a.status === 'pending').length, colorClass: 'bg-amber-500' },
    { label: 'Review', value: applications.filter((a) => a.status === 'underreview').length, colorClass: 'bg-cyan-500' },
    { label: 'Accepted', value: applications.filter((a) => a.status === 'accepted').length, colorClass: 'bg-emerald-500' },
    { label: 'Rejected', value: applications.filter((a) => a.status === 'rejected').length, colorClass: 'bg-rose-500' }
  ];

  return (
    <main className="min-h-screen px-4 py-12 bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6 flex items-center justify-between shadow-lg shadow-cyan-950/20">
          <div className="flex items-center gap-5">
            <img
              src={
                (isPlayer
                  ? (profile as any)?.avatarUrl
                  : (profile as any)?.logoUrl)
                || user?.avatar
                || ''
              }
              alt={user?.username}
              className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500"
            />
            <div>
              <h1 className="text-2xl font-bold">{user?.username}</h1>
              <p className="text-gray-400">{user?.email}</p>
              <span className={`text-xs px-3 py-1 rounded-full font-medium mt-1 inline-block ${isPlayer ? 'bg-cyan-900 text-cyan-300' : 'bg-indigo-900 text-indigo-300'}`}>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
            <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* {isPlayer ? (
                <>
                  <div><p className="text-gray-400 text-sm">Game</p><p className="font-medium">{profile.game}</p></div>
                  <div><p className="text-gray-400 text-sm">Rank</p><p className="font-medium">{profile.rank}</p></div>
                  <div><p className="text-gray-400 text-sm">Role</p><p className="font-medium">{profile.role}</p></div>
                  <div><p className="text-gray-400 text-sm">Region</p><p className="font-medium">{profile.region}</p></div>
                  <div><p className="text-gray-400 text-sm">Current Team</p><p className="font-medium">{profile.currentTeam?.teamName || 'Free Agent'}</p></div>
                </>
              ) : (
                <>
                  <div><p className="text-gray-400 text-sm">Team</p><p className="font-medium">{profile.teamName}</p></div>
                  <div><p className="text-gray-400 text-sm">Game</p><p className="font-medium">{profile.game}</p></div>
                  <div><p className="text-gray-400 text-sm">Region</p><p className="font-medium">{profile.region}</p></div>
                </>
              )} */}
              {isPlayer ? (
                <>
                  <div>
                    <p className="text-gray-400 text-sm">Game</p>
                    <p className="font-medium">{user?.playerProfile?.game || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Rank</p>
                    <p className="font-medium">{user?.playerProfile?.rank || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Role</p>
                    <p className="font-medium">{user?.playerProfile?.role || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Region</p>
                    <p className="font-medium">{user?.playerProfile?.region || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Current Team</p>
                    <p className="font-medium">{user?.playerProfile?.currentTeam?.teamName || 'Free Agent'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-gray-400 text-sm">Team</p>
                    <p className="font-medium">{user?.teamProfile?.teamName || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Game</p>
                    <p className="font-medium">{user?.teamProfile?.game || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Region</p>
                    <p className="font-medium">{user?.teamProfile?.region || 'Not set'}</p>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 flex gap-3">
              <a href={`/profile/${user?.id}`} target="_blank"
                className="text-cyan-400 hover:text-cyan-300 text-sm transition">
                View Public Profile →
              </a>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Applications" value={applications.length} />
          <StatCard label="Team Requests" value={teamRequests.length} />
          <StatCard label="Rooms" value={rooms.length} />
          <StatCard label="Listings" value={isPlayer ? 'N/A' : myListings.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <AppCard className="p-6">
            <h3 className="font-semibold mb-3">Status Analytics</h3>
            <MiniBarChart data={applicationStatusData} />
          </AppCard>
          <AppCard className="p-6">
            <h3 className="font-semibold mb-3">Activity Pulse</h3>
            <p className="text-sm text-slate-400 mb-4">
              {isPlayer
                ? 'Track your recruitment momentum across application phases.'
                : 'Track pipeline depth and conversion from review to accepted.'}
            </p>
            <div className="h-24 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/60 to-indigo-950/50 border border-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 opacity-40" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.25), transparent)' }} />
            </div>
          </AppCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Browse Listings</h3>
            <p className="text-gray-400 text-sm mb-4">
              {isPlayer ? 'Find teams looking for your role' : 'Find player listings and open opportunities'}
            </p>
            <AppButton
              onClick={() => router.push('/listings')}
              className="px-4 py-2">
              Browse Now
            </AppButton>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Post a Listing</h3>
            <p className="text-gray-400 text-sm mb-4">
              {isPlayer ? 'Post yourself as looking for a team' : 'Post your team as looking for a player'}
            </p>
            <AppButton
              onClick={() => router.push('/listings/create')}
              className="px-4 py-2">
              Post Now
            </AppButton>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">My Rooms</h3>
            <p className="text-gray-400 text-sm mb-4">
              {rooms.length ? `${rooms.length} active room${rooms.length > 1 ? 's' : ''}` : 'No active rooms yet'}
            </p>
            <AppButton
              onClick={() => router.push('/rooms')}
              variant="secondary"
              className="px-4 py-2"
            >
              Open Rooms
            </AppButton>
          </div>
        </div>

        {isPlayer && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
            <h2 className="text-lg font-semibold mb-4">My Applications</h2>
            {applications.length === 0 ? (
              <p className="text-slate-400 text-sm">No applications yet.</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="border border-slate-800 rounded-lg p-4 flex justify-between">
                    <div>
                      <p className="font-medium">{app.listing.team?.teamName || 'Team'} - {app.listing.game}</p>
                      <p className="text-sm text-slate-400">{app.listing.roleNeeded}</p>
                      {app.joinRequest && (
                        <p className="text-xs mt-1 text-cyan-300">
                          Team join request: {app.joinRequest.status}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded h-fit ${statusTone[app.status] || 'bg-slate-800'}`}>{app.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isPlayer && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
            <h2 className="text-lg font-semibold mb-4">Manage Applications</h2>
            {myListings.length === 0 ? (
              <p className="text-slate-400 text-sm">No listings yet. Post a listing to receive applications.</p>
            ) : (
              <>
                <div className="mb-4">
                  <label className="text-xs text-slate-400 block mb-1">Select listing</label>
                  <select
                    value={selectedListingId}
                    onChange={(e) => refreshListingApplications(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
                  >
                    {myListings.map((listing) => (
                      <option key={listing.id} value={listing.id}>
                        {listing.game} - {listing.roleNeeded} ({listing._count.applications} apps)
                      </option>
                    ))}
                  </select>
                </div>
                {listingApplications.length === 0 ? (
                  <p className="text-slate-400 text-sm">No applications on this listing.</p>
                ) : (
                  <div className="space-y-3">
                    {listingApplications.map((app) => (
                      <div key={app.id} className="border border-slate-800 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{app.player?.user.username || 'Player'}</p>
                            <p className="text-xs text-slate-400">
                              {app.player?.role || 'Role'} - {app.player?.rank || 'Rank'} - {app.player?.region || 'Region'}
                            </p>
                            {app.pitch && <p className="text-sm text-slate-300 mt-1">{app.pitch}</p>}
                            {app.player?.bio && <p className="text-xs text-slate-400 mt-1">{app.player.bio}</p>}
                            {app.player?.highlightUrl && (
                              <a className="text-xs text-cyan-300" href={app.player.highlightUrl} target="_blank" rel="noreferrer">
                                View highlight
                              </a>
                            )}
                            {app.joinRequest && (
                              <p className="text-xs text-cyan-300 mt-1">Join request: {app.joinRequest.status}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${statusTone[app.status] || 'bg-slate-800'}`}>
                            {app.status}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {['underreview', 'accepted', 'rejected'].map((status) => (
                            <button
                              key={status}
                              onClick={async () => {
                                await api.put(`/applications/${app.id}/status`, { status });
                                await refreshListingApplications(selectedListingId);
                                await loadDashboard();
                              }}
                              className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded"
                            >
                              Mark {status}
                            </button>
                          ))}
                          {app.status === 'accepted' && !app.joinRequest && (
                            <button
                              onClick={async () => {
                                await api.post('/applications/join-requests', {
                                  applicationId: app.id,
                                  message: 'We would like you to join our team roster.'
                                });
                                await refreshListingApplications(selectedListingId);
                                await loadDashboard();
                              }}
                              className="text-xs bg-cyan-700 hover:bg-cyan-600 px-3 py-1 rounded"
                            >
                              Send Team Join Request
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {isPlayer && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
            <h2 className="text-lg font-semibold mb-4">Team Join Requests</h2>
            {joinRequests.length === 0 ? (
              <p className="text-slate-400 text-sm">No join requests yet.</p>
            ) : (
              <div className="space-y-3">
                {joinRequests.map((request) => (
                  <div key={request.id} className="border border-slate-800 rounded-lg p-4">
                    <p className="font-medium">{request.team.teamName}</p>
                    <p className="text-sm text-slate-400">{request.application.listing.game} - {request.application.listing.roleNeeded}</p>
                    {request.message && <p className="text-sm mt-1">{request.message}</p>}
                    <div className="flex gap-2 items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${statusTone[request.status] || 'bg-slate-800'}`}>{request.status}</span>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={async () => {
                              await api.put(`/applications/join-requests/${request.id}/status`, { status: 'accepted' });
                              await loadDashboard();
                            }}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded"
                          >
                            Accept
                          </button>
                          <button
                            onClick={async () => {
                              await api.put(`/applications/join-requests/${request.id}/status`, { status: 'rejected' });
                              await loadDashboard();
                            }}
                            className="text-xs bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-lg font-semibold mb-4">{isPlayer ? 'Team Requests' : 'Sent Player Requests'}</h2>
          {teamRequests.length === 0 ? (
            <p className="text-slate-400 text-sm">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {teamRequests.map((request) => (
                <div key={request.id} className="border border-slate-800 rounded-lg p-4">
                  <p className="font-medium">
                    {isPlayer ? request.team?.teamName : request.player?.user.username} - {request.listing.game}
                  </p>
                  <p className="text-sm text-slate-400 mb-2">{request.listing.roleNeeded}</p>
                  {request.message && <p className="text-sm mb-2">{request.message}</p>}
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-slate-800">{request.status}</span>
                    {isPlayer && request.status === 'pending' && (
                      <>
                        <button
                          onClick={async () => {
                            await api.put(`/team-requests/${request.id}/status`, { status: 'accepted' });
                            await loadDashboard();
                          }}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded"
                        >
                          Accept
                        </button>
                        <button
                          onClick={async () => {
                            await api.put(`/team-requests/${request.id}/status`, { status: 'rejected' });
                            await loadDashboard();
                          }}
                          className="text-xs bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {request.room && <span className="text-xs text-cyan-300">Room created</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}