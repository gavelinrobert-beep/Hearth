import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Message } from '../types';

interface UseMessagesOptions {
  channelId: string;
  limit?: number;
}

interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchMessages: () => Promise<void>;
  fetchMoreMessages: () => Promise<void>;
  addMessage: (message: Message) => void;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  clearMessages: () => void;
}

export function useMessages({ channelId, limit = 50 }: UseMessagesOptions): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!channelId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/channels/${channelId}/messages`, {
        params: { limit },
      });

      const fetchedMessages = response.data.messages || response.data;
      setMessages(fetchedMessages);
      setHasMore(fetchedMessages.length === limit);
      
      if (fetchedMessages.length > 0) {
        setCursor(fetchedMessages[fetchedMessages.length - 1].id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(errorMessage);
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [channelId, limit]);

  const fetchMoreMessages = useCallback(async () => {
    if (!channelId || !hasMore || isLoading || !cursor) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/channels/${channelId}/messages`, {
        params: { limit, cursor },
      });

      const fetchedMessages = response.data.messages || response.data;
      setMessages((prev) => [...prev, ...fetchedMessages]);
      setHasMore(fetchedMessages.length === limit);
      
      if (fetchedMessages.length > 0) {
        setCursor(fetchedMessages[fetchedMessages.length - 1].id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch more messages';
      setError(errorMessage);
      console.error('Error fetching more messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [channelId, limit, cursor, hasMore, isLoading]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  const editMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const response = await api.patch(`/messages/${messageId}`, { content });
      const updatedMessage = response.data;

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...updatedMessage } : m))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit message';
      setError(errorMessage);
      console.error('Error editing message:', err);
      throw err;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await api.delete(`/messages/${messageId}`);

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete message';
      setError(errorMessage);
      console.error('Error deleting message:', err);
      throw err;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCursor(null);
    setHasMore(true);
    setError(null);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    hasMore,
    fetchMessages,
    fetchMoreMessages,
    addMessage,
    editMessage,
    deleteMessage,
    clearMessages,
  };
}
