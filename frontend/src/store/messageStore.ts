import { create } from 'zustand';
import { Message } from '../types';

interface MessageState {
  messages: Record<string, Message[]>;
  addMessage: (channelId: string, message: Message) => void;
  editMessage: (channelId: string, messageId: string, content: string) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  setMessages: (channelId: string, messages: Message[]) => void;
  clearMessages: (channelId: string) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: {},
  
  addMessage: (channelId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [channelId]: [...(state.messages[channelId] || []), message],
    },
  })),
  
  editMessage: (channelId, messageId, content) => set((state) => ({
    messages: {
      ...state.messages,
      [channelId]: (state.messages[channelId] || []).map((msg) =>
        msg.id === messageId ? { ...msg, content } : msg
      ),
    },
  })),
  
  deleteMessage: (channelId, messageId) => set((state) => ({
    messages: {
      ...state.messages,
      [channelId]: (state.messages[channelId] || []).filter((msg) => msg.id !== messageId),
    },
  })),
  
  setMessages: (channelId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [channelId]: messages,
    },
  })),
  
  clearMessages: (channelId) => set((state) => {
    const { [channelId]: _, ...rest } = state.messages;
    return { messages: rest };
  }),
}));
