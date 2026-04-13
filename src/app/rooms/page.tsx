'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getToken } from '@/lib/auth';

interface RoomItem {
  id: string;
  team: { teamName: string };
  player: { user: { username: string } };
}

interface MessageItem {
  id: string;
  senderUserId: string;
  content: string;
  createdAt: string;
}

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [draft, setDraft] = useState('');
  const [myUserId, setMyUserId] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    Promise.all([api.get('/rooms/my'), api.get('/auth/me')]).then(([roomsRes, meRes]) => {
      setRooms(roomsRes.data);
      setMyUserId(meRes.data.id);
      if (roomsRes.data.length > 0) setSelectedRoomId(roomsRes.data[0].id);
    });
  }, [router]);

  useEffect(() => {
    if (!selectedRoomId) return;

    const fetchMessages = () => {
      api.get(`/rooms/${selectedRoomId}/messages`).then((res) => setMessages(res.data));
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedRoomId]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId),
    [rooms, selectedRoomId]
  );

  const sendMessage = async () => {
    if (!selectedRoomId || !draft.trim()) return;
    await api.post(`/rooms/${selectedRoomId}/messages`, { content: draft.trim() });
    setDraft('');
    const res = await api.get(`/rooms/${selectedRoomId}/messages`);
    setMessages(res.data);
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Rooms</h1>
          <button onClick={() => router.push('/dashboard')} className="text-slate-300 hover:text-white text-sm">
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <h2 className="text-sm text-slate-400 mb-2">Your rooms</h2>
            <div className="space-y-2">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full text-left rounded-lg p-3 border transition ${
                    selectedRoomId === room.id
                      ? 'border-cyan-500 bg-cyan-950/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <p className="font-medium text-sm">{room.team.teamName}</p>
                  <p className="text-xs text-slate-400">with {room.player.user.username}</p>
                </button>
              ))}
              {rooms.length === 0 && <p className="text-sm text-slate-500">No rooms yet.</p>}
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 min-h-[520px] flex flex-col">
            {!selectedRoom ? (
              <div className="m-auto text-slate-500">Select a room to start chatting.</div>
            ) : (
              <>
                <div className="border-b border-slate-800 pb-3 mb-3">
                  <p className="font-semibold">{selectedRoom.team.teamName} x {selectedRoom.player.user.username}</p>
                  <p className="text-xs text-slate-400">Live polling every 3 seconds</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {messages.length === 0 ? (
                    <p className="text-sm text-slate-500">No messages yet.</p>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className={message.senderUserId === myUserId ? 'text-right' : ''}>
                        <div className={`inline-block px-3 py-2 rounded-lg text-sm ${
                          message.senderUserId === myUserId ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-100'
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
                  />
                  <button onClick={sendMessage} className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg">
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
