import { useState } from 'react';
import { Hash, Volume2, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Server } from '../pages/Chat';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import VoiceChannel from './Voice/VoiceChannel';
import VoiceControls from './Voice/VoiceControls';

interface SidebarProps {
  server: Server;
  onServerUpdate: () => void;
}

export default function Sidebar({ server, onServerUpdate }: SidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelName, setChannelName] = useState('');

  const handleCreateChannel = async () => {
    try {
      await api.post('/channels', {
        name: channelName,
        serverId: server.id,
        type: 'text',
      });
      setChannelName('');
      setShowCreateChannel(false);
      onServerUpdate();
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  return (
    <>
      <div className="w-60 bg-dark-800 flex flex-col">
        <div className="h-16 px-4 flex items-center justify-between border-b border-dark-700">
          <h2 className="font-bold text-lg truncate">{server.name}</h2>
          <button className="text-gray-400 hover:text-gray-300">
            <Settings size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          <div className="mb-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase">
                Text Channels
              </h3>
              <button
                onClick={() => setShowCreateChannel(true)}
                className="text-gray-400 hover:text-gray-300"
              >
                <Plus size={16} />
              </button>
            </div>
            {server.channels
              .filter((channel) => channel.type === 'text')
              .map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => navigate(`/server/${server.id}/channel/${channel.id}`)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-dark-700 text-gray-300 hover:text-gray-100 transition"
                >
                  <Hash size={18} />
                  <span>{channel.name}</span>
                </button>
              ))}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase">
                Voice Channels
              </h3>
            </div>
            {server.channels
              .filter((channel) => channel.type === 'voice')
              .map((channel) => (
                <VoiceChannel key={channel.id} channel={channel} />
              ))}
          </div>
        </div>

        <div className="h-14 bg-dark-900 px-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-semibold">
            {user?.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{user?.username}</div>
            <div className="text-xs text-gray-400">Online</div>
          </div>
          <VoiceControls />
        </div>
      </div>

      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Channel</h2>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Channel name"
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateChannel(false)}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChannel}
                disabled={!channelName.trim()}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
