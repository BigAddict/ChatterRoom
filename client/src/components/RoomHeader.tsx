import React from 'react';

export interface RoomHeaderProps {
  roomId: string;
  userCount: number;
}

/**
 * Header bar for a chat room displaying the room name, connected user count,
 * and a button to copy the room link to the clipboard.
 */
export const RoomHeader: React.FC<RoomHeaderProps> = ({ roomId, userCount }) => {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Fallback: ignore if clipboard API unavailable
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-700 px-6 py-3">
      <div>
        <h2 className="text-lg font-bold">🏴‍☠️ Room {roomId.slice(0, 8)}</h2>
        <p className="text-sm text-gray-400">{userCount} user{userCount !== 1 ? 's' : ''} online</p>
      </div>
      <button
        onClick={handleCopyLink}
        className="rounded bg-gray-700 px-4 py-1 text-sm transition hover:bg-gray-600"
      >
        Copy Link
      </button>
    </header>
  );
};
