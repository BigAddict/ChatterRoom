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
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-700 p-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message…"
        disabled={disabled}
        className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="rounded-lg bg-indigo-600 px-6 py-2 font-semibold transition hover:bg-indigo-500 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
};
