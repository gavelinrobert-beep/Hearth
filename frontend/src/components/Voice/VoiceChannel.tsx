/**
 * VoiceChannel component for displaying and interacting with voice channels
 */

import { Volume2, Phone, PhoneOff, Mic, MicOff, Users } from 'lucide-react';
import { Channel } from '../../types';
import { useVoice } from '../../hooks/useVoice';
import { useAuthStore } from '../../store/authStore';

interface VoiceChannelProps {
  channel: Channel;
}

export default function VoiceChannel({ channel }: VoiceChannelProps) {
  const { voiceState, joinVoiceChannel, leaveVoiceChannel, toggleMute } = useVoice();
  const { user } = useAuthStore();

  const isInThisChannel = voiceState?.channelId === channel.id;
  const isConnecting = isInThisChannel && voiceState?.isConnecting;
  const isConnected = isInThisChannel && voiceState?.isConnected;
  const isMuted = voiceState?.isMuted || false;

  const handleJoinLeave = async () => {
    if (isConnected || isConnecting) {
      await leaveVoiceChannel();
    } else {
      await joinVoiceChannel(channel.id);
    }
  };

  return (
    <div>
      {/* Channel button */}
      <button
        onClick={handleJoinLeave}
        disabled={isConnecting}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition ${
          isConnected
            ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
            : 'hover:bg-dark-700 text-gray-300 hover:text-gray-100'
        } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Volume2 size={18} />
        <span className="flex-1 text-left">{channel.name}</span>
        {isConnected && (
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span className="text-xs">
              {(voiceState?.participants.length || 0) + 1}
            </span>
          </div>
        )}
      </button>

      {/* Voice controls when connected */}
      {isConnected && (
        <div className="mt-2 px-2 py-2 bg-dark-700 rounded-lg">
          <div className="text-xs text-gray-400 mb-2">Connected to {channel.name}</div>
          
          {/* Participants list */}
          <div className="mb-2 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <div
                className={`w-2 h-2 rounded-full ${
                  isMuted ? 'bg-red-500' : 'bg-green-500'
                }`}
              />
              <span className="text-gray-300">{user?.username} (You)</span>
              {isMuted && <span className="text-xs text-red-400">Muted</span>}
            </div>
            {voiceState?.participants.map((participant) => (
              <div key={participant.userId} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-300">{participant.username}</span>
              </div>
            ))}
          </div>

          {/* Control buttons */}
          <div className="flex gap-2">
            <button
              onClick={toggleMute}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition ${
                isMuted
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            <button
              onClick={leaveVoiceChannel}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition text-white"
            >
              <PhoneOff size={16} />
              <span className="text-sm">Leave</span>
            </button>
          </div>

          {/* Error message */}
          {voiceState?.error && (
            <div className="mt-2 text-xs text-red-400 bg-red-900/20 p-2 rounded">
              {voiceState.error}
            </div>
          )}
        </div>
      )}

      {/* Connecting state */}
      {isConnecting && (
        <div className="mt-2 px-2 py-2 bg-blue-600/20 rounded text-xs text-blue-400">
          Connecting...
        </div>
      )}
    </div>
  );
}
