import React, { useState } from 'react';

export interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

/**
 * Text input field with a send button for composing messages.
 */
export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="chat-message-input flex gap-2 border-t border-gray-700 p-3 sm:p-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message…"
        disabled={disabled}
        className="min-w-0 flex-1 rounded-lg bg-gray-800 px-3 py-2 text-base text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 sm:px-4"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="min-h-11 rounded-lg bg-indigo-600 px-4 py-2 font-semibold transition hover:bg-indigo-500 disabled:opacity-50 sm:px-6"
      >
        Send
      </button>
    </form>
  );
};
