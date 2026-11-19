import { useState, useCallback } from 'react';
import type { ChatMessage } from '../components/ChatWindow';

export interface UseRoomReturn {
  /** All messages in the current room. */
  messages: ChatMessage[];
  /** Number of users currently in the room. */
  userCount: number;
  /** Add a new message to the room state. */
  addMessage: (message: ChatMessage) => void;
  /** Update the connected user count. */
  setUserCount: (count: number) => void;
  /** Clear all messages (e.g. on room leave). */
  clearMessages: () => void;
}

/**
 * Custom hook for managing room-level state: messages and user count.
 *
 * @returns Room state and mutators
 */
export const useRoom = (): UseRoomReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userCount, setUserCount] = useState(0);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, userCount, addMessage, setUserCount, clearMessages };
};
