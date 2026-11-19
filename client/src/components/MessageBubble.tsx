import React from 'react';
import type { ChatMessage } from './ChatWindow';

export interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * Renders a single chat message bubble, aligned left or right depending
 * on whether it was sent by the current user.
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const alignment = message.isMine ? 'justify-end' : 'justify-start';
  const bubbleColor = message.isMine ? 'bg-indigo-600' : 'bg-gray-700';

  return (
    <div className={`mb-2 flex ${alignment}`}>
      <div className={`max-w-xs rounded-lg px-4 py-2 ${bubbleColor}`}>
        {!message.isMine && (
          <p className="mb-1 text-xs font-semibold text-indigo-300">{message.sender}</p>
        )}
        <p className="text-sm">{message.content}</p>
        <p className="mt-1 text-right text-xs text-gray-400">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
