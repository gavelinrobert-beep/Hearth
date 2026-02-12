import { create } from 'zustand';
import { Server, Channel } from '../types';

interface ServerState {
  servers: Server[];
  channels: Channel[];
  currentServer: Server | null;
  currentChannel: Channel | null;
  setServers: (servers: Server[]) => void;
  addServer: (server: Server) => void;
  updateServer: (serverId: string, updates: Partial<Server>) => void;
  deleteServer: (serverId: string) => void;
  setChannels: (channels: Channel[]) => void;
  addChannel: (channel: Channel) => void;
  updateChannel: (channelId: string, updates: Partial<Channel>) => void;
  deleteChannel: (channelId: string) => void;
  setCurrentServer: (server: Server | null) => void;
  setCurrentChannel: (channel: Channel | null) => void;
}

export const useServerStore = create<ServerState>((set) => ({
  servers: [],
  channels: [],
  currentServer: null,
  currentChannel: null,
  
  setServers: (servers) => set({ servers }),
  
  addServer: (server) => set((state) => ({
    servers: [...state.servers, server],
  })),
  
  updateServer: (serverId, updates) => set((state) => ({
    servers: state.servers.map((server) =>
      server.id === serverId ? { ...server, ...updates } : server
    ),
    currentServer: state.currentServer?.id === serverId
      ? { ...state.currentServer, ...updates }
      : state.currentServer,
  })),
  
  deleteServer: (serverId) => set((state) => ({
    servers: state.servers.filter((server) => server.id !== serverId),
    currentServer: state.currentServer?.id === serverId ? null : state.currentServer,
  })),
  
  setChannels: (channels) => set({ channels }),
  
  addChannel: (channel) => set((state) => ({
    channels: [...state.channels, channel],
  })),
  
  updateChannel: (channelId, updates) => set((state) => ({
    channels: state.channels.map((channel) =>
      channel.id === channelId ? { ...channel, ...updates } : channel
    ),
    currentChannel: state.currentChannel?.id === channelId
      ? { ...state.currentChannel, ...updates }
      : state.currentChannel,
  })),
  
  deleteChannel: (channelId) => set((state) => ({
    channels: state.channels.filter((channel) => channel.id !== channelId),
    currentChannel: state.currentChannel?.id === channelId ? null : state.currentChannel,
  })),
  
  setCurrentServer: (server) => set({ currentServer: server }),
  
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
}));
