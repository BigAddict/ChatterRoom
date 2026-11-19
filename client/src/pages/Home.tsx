import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Generates a cryptographically random hex string to use as a room key.
 * @param length - Number of random bytes (default 32 for 256-bit key)
 * @returns Hex-encoded random string
 */
const generateRandomKey = (length = 32): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Generates a random room ID.
 * @returns A short random room identifier
 */
const generateRoomId = (): string => {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Landing page component.
 * Provides a "Create Room" button that generates a new room with a
 * cryptographic key embedded in the URL hash fragment.
 */
export const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    const key = generateRandomKey();
    navigate(`/room/${roomId}#${key}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold">🏴‍☠️ ChatterRoom</h1>
        <p className="mb-8 text-lg text-gray-400">
          End-to-end encrypted chat. No sign-up required.
        </p>
        <button
          onClick={handleCreateRoom}
          className="rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold transition hover:bg-indigo-500"
        >
          Create Room
        </button>
      </div>
    </div>
  );
};
