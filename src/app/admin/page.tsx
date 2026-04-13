'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AppButton, AppCard, MiniBarChart, StatCard } from '@/components/ui';

interface Overview {
  users: number;
  players: number;
  teams: number;
  listings: number;
  applications: number;
  teamRequests: number;
  rooms: number;
  messages: number;
}

interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  deletedAt?: string | null;
}

interface AdminListing {
  id: string;
  game: string;
  roleNeeded: string;
  type: string;
  status: string;
  deletedAt?: string | null;
}

interface AdminApplication {
  id: string;
  status: string;
  player?: { user?: { username?: string } };
  listing?: { game?: string };
  deletedAt?: string | null;
}

interface AdminRoom {
  id: string;
  team?: { teamName?: string };
  player?: { user?: { username?: string } };
  _count?: { messages?: number };
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor?: { username?: string | null };
}

interface ConfigGame {
  name: string;
  ranks: string[];
  roles: string[];
}

interface PlatformConfig {
  regions: string[];
  gameConfigs: ConfigGame[];
}

export default function AdminPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [config, setConfig] = useState<PlatformConfig>({ regions: [], gameConfigs: [] });
  const [newGame, setNewGame] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [newRank, setNewRank] = useState('');
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const [meRes, oRes, uRes, lRes, aRes, rRes, logRes, cfgRes] = await Promise.all([
      api.get('/auth/me'),
      api.get('/admin/overview'),
      api.get('/admin/users'),
      api.get('/admin/listings'),
      api.get('/admin/applications'),
      api.get('/admin/rooms'),
      api.get('/admin/audit-logs'),
      api.get('/admin/config')
    ]);
    if (!meRes.data?.isOwner) {
      router.push('/dashboard');
      return;
    }
    setOverview(oRes.data);
    setUsers(uRes.data);
    setListings(lRes.data);
    setApplications(aRes.data);
    setRooms(rRes.data);
    setLogs(logRes.data);
    setConfig(cfgRes.data);
    if (cfgRes.data.gameConfigs.length > 0) {
      setSelectedGame((prev) => prev || cfgRes.data.gameConfigs[0].name);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => setError('Owner access required or failed to load admin data.')).finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="min-h-screen p-8">Loading admin panel...</main>;

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Owner Admin Panel</h1>
          <p className="text-slate-400">Global management and full system visibility.</p>
          {error && <p className="text-rose-400 text-sm mt-2">{error}</p>}
        </div>

        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(overview).map(([key, value]) => (
              <StatCard key={key} label={key} value={value} />
            ))}
          </div>
        )}

        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppCard className="p-5">
              <h2 className="font-semibold mb-3">System Distribution</h2>
              <MiniBarChart
                data={[
                  { label: 'Users', value: overview.users, colorClass: 'bg-cyan-500' },
                  { label: 'Listings', value: overview.listings, colorClass: 'bg-indigo-500' },
                  { label: 'Apps', value: overview.applications, colorClass: 'bg-emerald-500' },
                  { label: 'Rooms', value: overview.rooms, colorClass: 'bg-amber-500' }
                ]}
              />
            </AppCard>
            <AppCard className="p-5">
              <h2 className="font-semibold mb-3">Recent Audit Actions</h2>
              <div className="space-y-2 max-h-48 overflow-auto">
                {logs.slice(0, 8).map((log) => (
                  <div key={log.id} className="text-xs border border-slate-800 rounded-lg p-2">
                    <p>{log.actor?.username || 'owner'} • {log.action} {log.entityType}</p>
                    <p className="text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </AppCard>
          </div>
        )}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="font-semibold mb-3">Platform Data Configuration</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="border border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium">Games</p>
              <div className="flex gap-2">
                <input
                  value={newGame}
                  onChange={(e) => setNewGame(e.target.value)}
                  placeholder="New game name"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                />
                <AppButton
                  onClick={async () => {
                    if (!newGame.trim()) return;
                    await api.post('/admin/config/games', { name: newGame.trim() });
                    setNewGame('');
                    await load();
                  }}
                >
                  Add
                </AppButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.gameConfigs.map((game) => (
                  <span key={game.name} className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs">
                    {game.name}
                    <button
                      onClick={async () => {
                        await api.delete('/admin/config/games', { data: { value: game.name } });
                        await load();
                      }}
                      className="text-rose-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium">Regions</p>
              <div className="flex gap-2">
                <input
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="New region"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                />
                <AppButton
                  onClick={async () => {
                    if (!newRegion.trim()) return;
                    await api.post('/admin/config/regions', { name: newRegion.trim() });
                    setNewRegion('');
                    await load();
                  }}
                >
                  Add
                </AppButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.regions.map((region) => (
                  <span key={region} className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs">
                    {region}
                    <button
                      onClick={async () => {
                        await api.delete('/admin/config/regions', { data: { value: region } });
                        await load();
                      }}
                      className="text-rose-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl p-4">
            <p className="text-sm font-medium mb-3">Game Ranks & Roles</p>
            <div className="mb-3">
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
              >
                {config.gameConfigs.map((game) => (
                  <option key={game.name} value={game.name}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
            {(() => {
              const game = config.gameConfigs.find((g) => g.name === selectedGame);
              if (!game) return <p className="text-sm text-slate-500">No game selected.</p>;
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Ranks</p>
                    <div className="flex gap-2 mb-2">
                      <input
                        value={newRank}
                        onChange={(e) => setNewRank(e.target.value)}
                        placeholder="Add rank"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                      />
                      <AppButton
                        onClick={async () => {
                          if (!newRank.trim()) return;
                          await api.post('/admin/config/ranks', { game: selectedGame, rank: newRank.trim() });
                          setNewRank('');
                          await load();
                        }}
                      >
                        Add
                      </AppButton>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {game.ranks.map((rank) => (
                        <span key={rank} className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs">
                          {rank}
                          <button
                            onClick={async () => {
                              await api.delete(`/admin/config/ranks/${encodeURIComponent(selectedGame)}`, { data: { value: rank } });
                              await load();
                            }}
                            className="text-rose-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-2">Roles</p>
                    <div className="flex gap-2 mb-2">
                      <input
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Add role"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                      />
                      <AppButton
                        onClick={async () => {
                          if (!newRole.trim()) return;
                          await api.post('/admin/config/roles', { game: selectedGame, role: newRole.trim() });
                          setNewRole('');
                          await load();
                        }}
                      >
                        Add
                      </AppButton>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {game.roles.map((role) => (
                        <span key={role} className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs">
                          {role}
                          <button
                            onClick={async () => {
                              await api.delete(`/admin/config/roles/${encodeURIComponent(selectedGame)}`, { data: { value: role } });
                              await load();
                            }}
                            className="text-rose-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="font-semibold mb-3">Listings</h2>
          <div className="space-y-2 max-h-80 overflow-auto">
            {listings.map((listing) => (
              <div key={listing.id} className="border border-slate-800 rounded-lg p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium">{listing.game} - {listing.roleNeeded}</p>
                  <p className="text-xs text-slate-400">{listing.type} / {listing.status}</p>
                </div>
                <select
                  defaultValue={listing.status}
                  onChange={async (e) => {
                    await api.put(`/admin/listings/${listing.id}/status`, { status: e.target.value });
                    await load();
                  }}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
                >
                  <option value="open">open</option>
                  <option value="closed">closed</option>
                </select>
                <AppButton
                  onClick={async () => {
                    if (listing.deletedAt) {
                      await api.post(`/admin/listings/${listing.id}/restore`);
                    } else {
                      await api.delete(`/admin/listings/${listing.id}`);
                    }
                    await load();
                  }}
                  variant={listing.deletedAt ? 'secondary' : 'danger'}
                  className="text-xs px-2 py-1"
                >
                  {listing.deletedAt ? 'Restore' : 'Soft Delete'}
                </AppButton>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="font-semibold mb-3">Users ({users.length})</h2>
            <div className="space-y-2 max-h-80 overflow-auto">
              {users.map((user) => (
                <div key={user.id} className="border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-slate-400">{user.email || 'No email'}</p>
                  </div>
                  <AppButton
                    onClick={async () => {
                      if (user.deletedAt) {
                        await api.post(`/admin/users/${user.id}/restore`);
                      } else {
                        await api.delete(`/admin/users/${user.id}`);
                      }
                      await load();
                    }}
                    variant={user.deletedAt ? 'secondary' : 'danger'}
                    className="text-xs px-2 py-1"
                  >
                    {user.deletedAt ? 'Restore' : 'Soft Delete'}
                  </AppButton>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="font-semibold mb-3">Applications ({applications.length})</h2>
            <div className="space-y-2 max-h-80 overflow-auto">
              {applications.map((app) => (
                <div key={app.id} className="border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{app.player?.user?.username || 'Player'} → {app.listing?.game}</p>
                    <p className="text-xs text-slate-400">{app.status}</p>
                  </div>
                  <AppButton
                    onClick={async () => {
                      if (app.deletedAt) {
                        await api.post(`/admin/applications/${app.id}/restore`);
                      } else {
                        await api.delete(`/admin/applications/${app.id}`);
                      }
                      await load();
                    }}
                    variant={app.deletedAt ? 'secondary' : 'danger'}
                    className="text-xs px-2 py-1"
                  >
                    {app.deletedAt ? 'Restore' : 'Soft Delete'}
                  </AppButton>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="font-semibold mb-3">Rooms ({rooms.length})</h2>
          <div className="space-y-2 max-h-80 overflow-auto">
            {rooms.map((room) => (
              <div key={room.id} className="border border-slate-800 rounded-lg p-3">
                <p className="font-medium">{room.team?.teamName} x {room.player?.user?.username}</p>
                <p className="text-xs text-slate-400">{room._count?.messages || 0} messages</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="font-semibold mb-3">Full Audit Trail ({logs.length})</h2>
          <div className="space-y-2 max-h-80 overflow-auto">
            {logs.map((log) => (
              <div key={log.id} className="border border-slate-800 rounded-lg p-3 text-sm">
                <p className="font-medium">{log.action} {log.entityType}</p>
                <p className="text-xs text-slate-500">Entity: {log.entityId}</p>
                <p className="text-xs text-slate-500">
                  Actor: {log.actor?.username || 'owner'} • {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
