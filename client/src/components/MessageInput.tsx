import React, { useState } from 'react';

export const MAX_MESSAGE_LENGTH = 2000;

export interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

/**
 * Determine whether a keydown event should submit the message.
 * Enter submits unless Shift is held or an IME composition is active.
 */
export const shouldSubmitMessageKey = (
  key: string,
  shiftKey: boolean,
  isComposing = false,
): boolean => key === 'Enter' && !shiftKey && !isComposing;

/**
 * Determine whether the send action should be disabled.
 */
export const isMessageSendDisabled = (
  text: string,
  disabled: boolean,
  maxLength = MAX_MESSAGE_LENGTH,
): boolean => disabled || !text.trim() || text.length > maxLength;

/**
 * Format the remaining/used character count indicator.
 */
export const formatCharacterCount = (
  length: number,
  maxLength = MAX_MESSAGE_LENGTH,
): string => `${length}/${maxLength}`;

/**
 * Text input field with a send button, Enter/Shift+Enter handling,
 * character limit indicator, and encryption lock badge.
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  maxLength = MAX_MESSAGE_LENGTH,
}) => {
  const [text, setText] = useState('');

  const submitMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || text.length > maxLength) return;
    onSend(trimmed);
    setText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (shouldSubmitMessageKey(e.key, e.shiftKey, e.nativeEvent.isComposing)) {
      e.preventDefault();
      submitMessage();
    }
  };

  const sendDisabled = isMessageSendDisabled(text, disabled, maxLength);
  const nearLimit = text.length >= Math.floor(maxLength * 0.85);

  return (
    <form
      onSubmit={handleSubmit}
      className="chat-message-input flex flex-col gap-1.5 border-t border-slate-300 bg-white p-3 transition-colors duration-300 dark:border-amber-500/20 dark:bg-[#131C2B] sm:p-4"
    >
      <div className="flex items-end gap-2">
        <span
          role="img"
          aria-label="End-to-end encrypted"
          title="End-to-end encrypted"
          className="flex h-11 shrink-0 select-none items-center justify-center px-1 text-lg"
        >
          🔒
        </span>
        <textarea
          rows={1}
          value={text}
          maxLength={maxLength}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message across the deck… (Enter to send, Shift+Enter for new line)"
          disabled={disabled}
          aria-label="Message input"
          className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-lg border border-slate-300 bg-slate-100 px-3 py-2.5 text-base text-slate-900 placeholder-slate-500 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40 dark:border-slate-700 dark:bg-[#0B111A] dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-amber-400 dark:focus:ring-amber-400/40 sm:px-4"
        />
        <button
          type="submit"
          disabled={sendDisabled}
          className="min-h-11 shrink-0 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-[#0B111A] transition-all duration-200 hover:bg-amber-400 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
        >
          Send
        </button>
      </div>
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
        <span>Shift+Enter for new line</span>
        <span
          className={
            nearLimit ? 'font-medium text-amber-600 dark:text-amber-400' : undefined
          }
        >
          {formatCharacterCount(text.length, maxLength)}
        </span>
      </div>
    </form>
  );
};