import { describe, expect, it } from 'vitest';
import {
  formatCharacterCount,
  isMessageSendDisabled,
  MAX_MESSAGE_LENGTH,
  shouldSubmitMessageKey,
} from '../src/components/MessageInput.js';

describe('MessageInput helpers (#18)', () => {
  describe('shouldSubmitMessageKey', () => {
    it('submits on plain Enter', () => {
      expect(shouldSubmitMessageKey('Enter', false, false)).toBe(true);
    });

    it('does not submit on Shift+Enter (allows newline)', () => {
      expect(shouldSubmitMessageKey('Enter', true, false)).toBe(false);
    });

    it('does not submit while IME composition is active', () => {
      expect(shouldSubmitMessageKey('Enter', false, true)).toBe(false);
    });

    it('does not submit for non-Enter keys', () => {
      expect(shouldSubmitMessageKey('a', false, false)).toBe(false);
    });
  });

  describe('isMessageSendDisabled', () => {
    it('disables when input is empty or whitespace-only', () => {
      expect(isMessageSendDisabled('', false)).toBe(true);
      expect(isMessageSendDisabled('   \n\t  ', false)).toBe(true);
    });

    it('disables when component is disabled', () => {
      expect(isMessageSendDisabled('hello', true)).toBe(true);
    });

    it('disables when text exceeds maxLength', () => {
      expect(isMessageSendDisabled('a'.repeat(MAX_MESSAGE_LENGTH + 1), false)).toBe(true);
    });

    it('enables when non-empty, within limit, and not disabled', () => {
      expect(isMessageSendDisabled('ahoy!', false)).toBe(false);
    });
  });

  describe('formatCharacterCount', () => {
    it('formats length/maxLength', () => {
      expect(formatCharacterCount(42, 2000)).toBe('42/2000');
    });
  });
});
