import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Server } from '../pages/Chat';
import api from '../services/api';

interface ServerListProps {
  servers: Server[];
  selectedServer: Server | null;
  onSelectServer: (server: Server) => void;
  onServersUpdate: () => void;
}

export default function ServerList({
  servers,
  selectedServer,
  onSelectServer,
  onServersUpdate,
}: ServerListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [serverName, setServerName] = useState('');

  const handleCreateServer = async () => {
    try {
      await api.post('/servers', { name: serverName });
      setServerName('');
      setShowCreateModal(false);
      onServersUpdate();
    } catch (error) {
      console.error('Failed to create server:', error);
    }
  };

  return (
    <>
      <div className="w-20 bg-dark-900 flex flex-col items-center py-4 gap-2">
        {servers.map((server) => (
          <button
            key={server.id}
            onClick={() => onSelectServer(server)}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition ${
              selectedServer?.id === server.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
            title={server.name}
          >
            {server.icon ? (
              <img src={server.icon} alt={server.name} className="w-full h-full rounded-full" />
            ) : (
              server.name.substring(0, 2).toUpperCase()
            )}
          </button>
        ))}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-12 h-12 rounded-full bg-dark-700 text-primary-400 hover:bg-dark-600 flex items-center justify-center transition"
          title="Create Server"
        >
          <Plus size={24} />
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Server</h2>
            <input
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="Server name"
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateServer}
                disabled={!serverName.trim()}
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
