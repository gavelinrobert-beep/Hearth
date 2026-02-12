import { useState } from 'react';
import { Send } from 'lucide-react';

export default function DirectMessages() {
  const [message, setMessage] = useState('');

  return (
    <div className="flex-1 flex flex-col bg-dark-700">
      <div className="h-16 px-4 flex items-center border-b border-dark-600">
        <h2 className="font-bold text-lg">Direct Messages</h2>
      </div>

      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a user to start a conversation
      </div>

      <form className="p-4">
        <div className="flex items-center gap-2 bg-dark-600 rounded-lg px-4 py-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="text-primary-400 hover:text-primary-300 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
