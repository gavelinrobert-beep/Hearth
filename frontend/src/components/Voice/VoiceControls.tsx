/**
 * VoiceControls - Compact voice control buttons for the bottom bar
 */

import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';

export default function VoiceControls() {
  const { voiceState, leaveVoiceChannel, toggleMute } = useVoice();

  if (!voiceState?.isConnected) {
    return null;
  }

  const isMuted = voiceState.isMuted;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-dark-800 rounded-lg">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500'}`} />
        <span className="text-sm text-gray-300">Voice Connected</span>
      </div>
      
      <div className="flex gap-1 ml-2">
        <button
          onClick={toggleMute}
          className={`p-2 rounded transition ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
        <button
          onClick={leaveVoiceChannel}
          className="p-2 bg-red-600 hover:bg-red-700 rounded transition text-white"
          title="Disconnect"
        >
          <PhoneOff size={16} />
        </button>
      </div>
    </div>
  );
}
