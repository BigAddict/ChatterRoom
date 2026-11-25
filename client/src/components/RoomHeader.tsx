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
    <header className="flex items-center justify-between border-b border-gray-700 px-3 py-2 sm:px-6 sm:py-3">
      <div>
        <h2 className="text-base font-bold sm:text-lg">🏴‍☠️ Room {roomId.slice(0, 8)}</h2>
        <p className="text-xs text-gray-400 sm:text-sm">{userCount} user{userCount !== 1 ? 's' : ''} online</p>
      </div>
      <button
        onClick={handleCopyLink}
        className="min-h-11 rounded bg-gray-700 px-3 py-2 text-sm transition hover:bg-gray-600 sm:px-4 sm:py-1"
      >
        Copy Link
      </button>
    </header>
  );
};
