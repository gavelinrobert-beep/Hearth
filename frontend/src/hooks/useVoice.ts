/**
 * React hook for voice channel functionality
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceService } from '../services/voice';
import { VoiceState } from '../types';
import { getSocket } from '../services/socket';

export function useVoice() {
  const [voiceState, setVoiceState] = useState<VoiceState | null>(null);
  const voiceServiceRef = useRef<VoiceService | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Initialize voice service
    const voiceService = new VoiceService();
    voiceService.init(socket, {
      onUserJoined: (participant) => {
        setVoiceState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            participants: [...prev.participants, participant],
          };
        });
      },
      onUserLeft: (userId) => {
        setVoiceState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            participants: prev.participants.filter((p) => p.userId !== userId),
          };
        });
      },
      onConnected: () => {
        setVoiceState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            isConnecting: false,
            isConnected: true,
            error: undefined,
          };
        });
      },
      onDisconnected: () => {
        setVoiceState(null);
      },
      onError: (error) => {
        setVoiceState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            isConnecting: false,
            isConnected: false,
            error,
          };
        });
      },
    });

    voiceServiceRef.current = voiceService;

    return () => {
      // Cleanup on unmount
      (async () => {
        await voiceService.destroy();
      })();
      voiceServiceRef.current = null;
    };
  }, []);

  const joinVoiceChannel = useCallback(async (channelId: string) => {
    try {
      setVoiceState({
        channelId,
        isMuted: false,
        isConnecting: true,
        isConnected: false,
        participants: [],
      });

      await voiceServiceRef.current?.joinChannel(channelId);
    } catch (error) {
      console.error('Failed to join voice channel:', error);
      setVoiceState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isConnecting: false,
          error: error instanceof Error ? error.message : 'Failed to join voice channel',
        };
      });
    }
  }, []);

  const leaveVoiceChannel = useCallback(async () => {
    await voiceServiceRef.current?.leaveChannel();
    setVoiceState(null);
  }, []);

  const toggleMute = useCallback(() => {
    if (!voiceServiceRef.current) return;

    const currentMuted = voiceServiceRef.current.isMuted();
    const newMutedState = !currentMuted;
    voiceServiceRef.current.setMuted(newMutedState);
    
    setVoiceState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isMuted: newMutedState,
      };
    });
  }, []);

  return {
    voiceState,
    joinVoiceChannel,
    leaveVoiceChannel,
    toggleMute,
  };
}

export default useVoice;
