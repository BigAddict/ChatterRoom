import React from 'react';
import { ChatWindow } from './ChatWindow.js';
import { MessageInput } from './MessageInput.js';
import { RoomHeader } from './RoomHeader.js';

interface ChatRoomProps {
  roomId: string;
}

/**
 * ChatRoom Container Component
 * Coordinates RoomHeader, ChatWindow, and MessageInput.
 */
export const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <RoomHeader roomId={roomId} userCount={1} onLeave={() => window.location.href = '/'} />
      <div className="flex-1 overflow-hidden p-4">
        <ChatWindow messages={[]} currentUserId="me" />
      </div>
      <div className="p-4 border-t border-gray-800">
        <MessageInput onSendMessage={(content) => console.log('Send message:', content)} />
      </div>
    </div>
  );
};
