import { useEffect, useState, useRef } from 'react';
import { Hash, Send, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { getSocket } from '../services/socket';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Message {
  id: string;
  content: string;
  userId: string;
  channelId?: string;
  fileUrl?: string;
  moderated: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
}

interface Channel {
  id: string;
  name: string;
  type: string;
}

interface ChannelViewProps {
  channelId: string;
  serverId: string;
}

export default function ChannelView({ channelId }: ChannelViewProps) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { user } = useAuthStore();

  useEffect(() => {
    if (channelId) {
      loadChannel();
      loadMessages();
      const socket = getSocket();
      
      if (socket) {
        socket.emit('join-channel', channelId);

        socket.on('new-message', (message: Message) => {
          if (message.channelId === channelId) {
            setMessages((prev) => [...prev, message]);
          }
        });

        socket.on('user-typing', ({ username, channelId: typingChannelId }) => {
          if (typingChannelId === channelId && username !== user?.username) {
            setTypingUsers((prev) => [...new Set([...prev, username])]);
          }
        });

        socket.on('user-stopped-typing', ({ userId, channelId: typingChannelId }) => {
          if (typingChannelId === channelId) {
            setTypingUsers((prev) => prev.filter((u) => u !== userId));
          }
        });

        return () => {
          socket.emit('leave-channel', channelId);
          socket.off('new-message');
          socket.off('user-typing');
          socket.off('user-stopped-typing');
        };
      }
    }
  }, [channelId, user?.username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChannel = async () => {
    try {
      const response = await api.get(`/channels/${channelId}`);
      setChannel(response.data);
    } catch (error) {
      console.error('Failed to load channel:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/channel/${channelId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channelId) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('send-message', {
        channelId: channelId,
        content: newMessage,
      });
      setNewMessage('');
      handleTypingStop();
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (socket && channelId) {
      socket.emit('typing-start', channelId);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop();
      }, 3000);
    }
  };

  const handleTypingStop = () => {
    const socket = getSocket();
    if (socket && channelId) {
      socket.emit('typing-stop', channelId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  if (loading || !channel) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-700">
      <div className="h-16 px-4 flex items-center border-b border-dark-600">
        <Hash size={24} className="text-gray-400 mr-2" />
        <h2 className="font-bold text-lg">{channel.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-semibold flex-shrink-0">
              {message.user.avatar ? (
                <img
                  src={message.user.avatar}
                  alt={message.user.username}
                  className="w-full h-full rounded-full"
                />
              ) : (
                message.user.username.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold">{message.user.username}</span>
                <span className="text-xs text-gray-400">
                  {format(new Date(message.createdAt), 'HH:mm')}
                </span>
              </div>
              <div className={message.moderated ? 'text-red-400' : 'text-gray-300'}>
                {message.moderated ? '[Message moderated by AI]' : message.content}
              </div>
              {message.fileUrl && (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:underline text-sm"
                >
                  View attachment
                </a>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-400">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-4">
        <div className="flex items-center gap-2 bg-dark-600 rounded-lg px-4 py-3">
          <button type="button" className="text-gray-400 hover:text-gray-300">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder={`Message #${channel.name}`}
            className="flex-1 bg-transparent outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="text-primary-400 hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
