import { useEffect, useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { getSocket } from '../services/socket';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import ServerList from '../components/ServerList';
import ChannelView from '../components/ChannelView';
import DirectMessages from '../components/DirectMessages';

function ChannelViewWrapper() {
  const { channelId, serverId } = useParams();
  if (!channelId || !serverId) return null;
  return <ChannelView channelId={channelId} serverId={serverId} />;
}

export interface Server {
  id: string;
  name: string;
  icon?: string;
  channels: Channel[];
}

export interface Channel {
  id: string;
  name: string;
  type: string;
}

export default function Chat() {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServers();
    
    const socket = getSocket();
    if (socket) {
      socket.on('server-update', loadServers);
    }

    return () => {
      if (socket) {
        socket.off('server-update', loadServers);
      }
    };
  }, []);

  const loadServers = async () => {
    try {
      const response = await api.get('/servers');
      setServers(response.data);
      if (response.data.length > 0 && !selectedServer) {
        setSelectedServer(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load servers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-900">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-dark-900">
      <ServerList
        servers={servers}
        selectedServer={selectedServer}
        onSelectServer={setSelectedServer}
        onServersUpdate={loadServers}
      />
      {selectedServer && (
        <Sidebar
          server={selectedServer}
          onServerUpdate={loadServers}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            selectedServer?.channels[0] ? (
              <ChannelView
                channelId={selectedServer.channels[0].id}
                serverId={selectedServer.id}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a channel to start chatting
              </div>
            )
          }
        />
        <Route
          path="/server/:serverId/channel/:channelId"
          element={<ChannelViewWrapper />}
        />
        <Route path="/dm" element={<DirectMessages />} />
      </Routes>
    </div>
  );
}
