import api from '@/lib/api';

async function getProfile(userId: string) {
  try {
    const res = await api.get(`/profile/public/${userId}`);
    return res.data;
  } catch {
    return null;
  }
}

export default async function PublicProfilePage({
  params
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const profile = await getProfile(userId);

  if (!profile) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Profile not found.</p>
      </main>
    );
  }

  const isPlayer = !!profile.playerProfile;
  const data = profile.playerProfile || profile.teamProfile;

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-6">
            <img
              src={data?.avatarUrl || profile.avatar || '/default-avatar.png'}
              alt={profile.username}
              className="w-24 h-24 rounded-full object-cover border-2 border-cyan-500"
            />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${isPlayer ? 'bg-cyan-900 text-cyan-300' : 'bg-indigo-900 text-indigo-300'}`}>
                  {isPlayer ? 'Player' : 'Team'}
                </span>
              </div>
              {isPlayer && (
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${data?.available ? 'bg-green-400' : 'bg-gray-500'}`} />
                  <span className="text-sm text-slate-400">
                    {data?.available ? 'Available to recruit' : 'Not available'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {isPlayer ? 'Player Details' : 'Team Details'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {isPlayer ? (
              <>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Game</p>
                  <p className="font-medium">{data?.game}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Rank</p>
                  <p className="font-medium">{data?.rank}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Role</p>
                  <p className="font-medium">{data?.role}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Region</p>
                  <p className="font-medium">{data?.region}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Current Team</p>
                  <p className="font-medium">{data?.currentTeam?.teamName || 'Free Agent'}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Team Name</p>
                  <p className="font-medium">{data?.teamName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Game</p>
                  <p className="font-medium">{data?.game}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Region</p>
                  <p className="font-medium">{data?.region}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {data?.bio && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
            <h2 className="text-lg font-semibold mb-3">About</h2>
            <p className="text-slate-300 leading-relaxed">{data.bio}</p>
          </div>
        )}

        {/* Highlight */}
        {data?.highlightUrl && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
            <h2 className="text-lg font-semibold mb-3">Highlights</h2>
            <a href={data.highlightUrl} target="_blank" rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition underline">
              Watch Highlight Reel →
            </a>
          </div>
        )}

        {/* Team Discord */}
        {data?.discordUrl && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h2 className="text-lg font-semibold mb-3">Join the Team</h2>
            <a href={data.discordUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition">
              Join Discord Server →
            </a>
          </div>
        )}

      </div>
    </main>
  );
}