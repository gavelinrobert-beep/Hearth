import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, getSocket, disconnectSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import { Message } from '../types';

interface TypingData {
  userId: string;
  username: string;
  channelId: string;
}

interface SocketEvents {
  message: Message | null;
  messageUpdate: Message | null;
  messageDelete: { id: string; channelId: string } | null;
  userTyping: TypingData | null;
  userStoppedTyping: TypingData | null;
  error: string | null;
}

interface UseSocketReturn extends SocketEvents {
  isConnected: boolean;
  sendMessage: (channelId: string, content: string, fileUrl?: string) => void;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
}

export function useSocket(): UseSocketReturn {
  const { token } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<SocketEvents>({
    message: null,
    messageUpdate: null,
    messageDelete: null,
    userTyping: null,
    userStoppedTyping: null,
    error: null,
  });
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setIsConnected(false);
      return;
    }

    // Initialize socket connection
    const socket = initSocket(token);
    socketRef.current = socket;

    // Connection event handlers
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error('Connection error:', error);
      setEvents((prev) => ({ ...prev, error: error.message }));
      setIsConnected(false);
    };

    // Message event handlers
    const handleMessage = (message: Message) => {
      setEvents((prev) => ({ ...prev, message }));
    };

    const handleMessageUpdate = (message: Message) => {
      setEvents((prev) => ({ ...prev, messageUpdate: message }));
    };

    const handleMessageDelete = (data: { id: string; channelId: string }) => {
      setEvents((prev) => ({ ...prev, messageDelete: data }));
    };

    // Typing event handlers
    const handleUserTyping = (data: TypingData) => {
      setEvents((prev) => ({ ...prev, userTyping: data }));
    };

    const handleUserStoppedTyping = (data: TypingData) => {
      setEvents((prev) => ({ ...prev, userStoppedTyping: data }));
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('message', handleMessage);
    socket.on('messageUpdate', handleMessageUpdate);
    socket.on('messageDelete', handleMessageDelete);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('message', handleMessage);
      socket.off('messageUpdate', handleMessageUpdate);
      socket.off('messageDelete', handleMessageDelete);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
      disconnectSocket();
    };
  }, [token]);

  const emitSocketEvent = useCallback((event: string, data: any) => {
    const socket = getSocket();
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  }, [isConnected]);

  const sendMessage = useCallback((channelId: string, content: string, fileUrl?: string) => {
    emitSocketEvent('sendMessage', { channelId, content, fileUrl });
  }, [emitSocketEvent]);

  const joinChannel = useCallback((channelId: string) => {
    emitSocketEvent('joinChannel', channelId);
  }, [emitSocketEvent]);

  const leaveChannel = useCallback((channelId: string) => {
    emitSocketEvent('leaveChannel', channelId);
  }, [emitSocketEvent]);

  const startTyping = useCallback((channelId: string) => {
    emitSocketEvent('typing', { channelId });
  }, [emitSocketEvent]);

  const stopTyping = useCallback((channelId: string) => {
    emitSocketEvent('stopTyping', { channelId });
  }, [emitSocketEvent]);

  return {
    isConnected,
    ...events,
    sendMessage,
    joinChannel,
    leaveChannel,
    startTyping,
    stopTyping,
  };
}
