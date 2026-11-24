import React from "react";

export interface RoomHeaderProps {
  roomId: string;
  userCount: number;
  isEncrypted?: boolean;
  onLeave?: () => void;
}

/**
 * Header bar for a chat room displaying the room name, connected user count,
 * encryption status, and a button to copy the room link to the clipboard.
 */
export const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomId,
  userCount,
  isEncrypted = true,
  onLeave,
}) => {
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
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">🏴‍☠️ Room {roomId.slice(0, 8)}</h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isEncrypted
                ? "border border-emerald-700/50 bg-emerald-900/50 text-emerald-400"
                : "border border-yellow-700/50 bg-yellow-900/50 text-yellow-400"
            }`}
          >
            {isEncrypted ? "🔒 E2E Encrypted" : "⏳ Initializing…"}
          </span>
        </div>
        <p className="text-sm text-gray-400">
          {userCount} user{userCount !== 1 ? "s" : ""} online
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopyLink}
          className="rounded bg-gray-700 px-4 py-1 text-sm transition hover:bg-gray-600"
        >
          Copy Link
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="rounded bg-red-600 px-4 py-1 text-sm font-medium text-white transition hover:bg-red-500"
        >
          Leave Room
        </button>
      </div>
    </header>
  );
};
