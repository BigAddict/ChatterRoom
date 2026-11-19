import React from 'react';
import { MessageBubble } from './MessageBubble';

/** Represents a single chat message. */
export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  isMine: boolean;
}

export interface ChatWindowProps {
  messages: ChatMessage[];
}

/**
 * Displays a scrollable list of chat messages.
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
      ) : (
        messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
      )}
    </div>
  );
};
