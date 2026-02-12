import { create } from 'zustand';

interface UIState {
  isCreateServerModalOpen: boolean;
  isCreateChannelModalOpen: boolean;
  isSettingsModalOpen: boolean;
  selectedServerId: string | null;
  selectedChannelId: string | null;
  toggleCreateServerModal: () => void;
  toggleCreateChannelModal: () => void;
  toggleSettingsModal: () => void;
  setSelectedServerId: (serverId: string | null) => void;
  setSelectedChannelId: (channelId: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateServerModalOpen: false,
  isCreateChannelModalOpen: false,
  isSettingsModalOpen: false,
  selectedServerId: null,
  selectedChannelId: null,
  
  toggleCreateServerModal: () => set((state) => ({
    isCreateServerModalOpen: !state.isCreateServerModalOpen,
  })),
  
  toggleCreateChannelModal: () => set((state) => ({
    isCreateChannelModalOpen: !state.isCreateChannelModalOpen,
  })),
  
  toggleSettingsModal: () => set((state) => ({
    isSettingsModalOpen: !state.isSettingsModalOpen,
  })),
  
  setSelectedServerId: (serverId) => set({ selectedServerId: serverId }),
  
  setSelectedChannelId: (channelId) => set({ selectedChannelId: channelId }),
}));
