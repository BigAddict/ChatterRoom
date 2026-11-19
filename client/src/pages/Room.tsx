import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ChatWindow } from '../components/ChatWindow';
import { MessageInput } from '../components/MessageInput';
import { RoomHeader } from '../components/RoomHeader';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCrypto } from '../hooks/useCrypto';
import { useRoom } from '../hooks/useRoom';

/**
 * Chat room page.
 * Extracts the room ID from the URL path and the encryption key from the
 * URL hash fragment, then initialises WebSocket and crypto hooks.
 */
export const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();

  // The key lives in the hash fragment so it's never sent to the server
  const encryptionKey = location.hash.slice(1);

  const { keys, encrypt, decrypt, isReady: cryptoReady } = useCrypto(encryptionKey);
  const { sendMessage, connectionStatus } = useWebSocket(roomId ?? '');
  const { messages, userCount, addMessage } = useRoom();

  const handleSend = async (plaintext: string) => {
    if (!cryptoReady || !keys) return;
    // TODO: encrypt plaintext then send over WebSocket
    const encrypted = await encrypt(plaintext);
    sendMessage(encrypted);
  };

  if (!roomId || !encryptionKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p className="text-red-400">Invalid room link.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <RoomHeader roomId={roomId} userCount={userCount} />
      <ChatWindow messages={messages} />
      <MessageInput onSend={handleSend} disabled={connectionStatus !== 'connected'} />
    </div>
  );
};
