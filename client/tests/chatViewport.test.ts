import { describe, expect, it, vi } from 'vitest';
import { observeChatViewport } from '../src/lib/chatViewport.js';

class MockVisualViewport extends EventTarget {
  height = 720;
  offsetTop = 0;
}

class MockWindow extends EventTarget {
  innerHeight = 800;
  visualViewport: MockVisualViewport | null = new MockVisualViewport();
}

describe('observeChatViewport', () => {
  it('updates the room bounds when the visual viewport resizes or moves', () => {
    const rootStyle = {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
    };
    const viewport = new MockVisualViewport();
    const targetWindow = new MockWindow();
    targetWindow.visualViewport = viewport;
    const cleanup = observeChatViewport(rootStyle, targetWindow);

    expect(rootStyle.setProperty).toHaveBeenNthCalledWith(1, '--chat-viewport-height', '720px');
    expect(rootStyle.setProperty).toHaveBeenNthCalledWith(2, '--chat-viewport-offset-top', '0px');

    viewport.height = 420;
    viewport.dispatchEvent(new Event('resize'));
    expect(rootStyle.setProperty).toHaveBeenNthCalledWith(3, '--chat-viewport-height', '420px');
    expect(rootStyle.setProperty).toHaveBeenNthCalledWith(4, '--chat-viewport-offset-top', '0px');

    viewport.offsetTop = 36;
    viewport.dispatchEvent(new Event('scroll'));
    expect(rootStyle.setProperty).toHaveBeenNthCalledWith(5, '--chat-viewport-height', '420px');
    expect(rootStyle.setProperty).toHaveBeenNthCalledWith(6, '--chat-viewport-offset-top', '36px');

    cleanup();
    expect(rootStyle.removeProperty).toHaveBeenCalledWith('--chat-viewport-height');
    expect(rootStyle.removeProperty).toHaveBeenCalledWith('--chat-viewport-offset-top');

    const callsBeforeDispatch = rootStyle.setProperty.mock.calls.length;
    viewport.dispatchEvent(new Event('resize'));
    expect(rootStyle.setProperty).toHaveBeenCalledTimes(callsBeforeDispatch);
  });

  it('falls back to the window height when VisualViewport is unavailable', () => {
    const rootStyle = {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
    };
    const targetWindow = new MockWindow();
    targetWindow.visualViewport = null;

    const cleanup = observeChatViewport(rootStyle, targetWindow);

    expect(rootStyle.setProperty).toHaveBeenNthCalledWith(1, '--chat-viewport-height', '800px');
    expect(rootStyle.setProperty).toHaveBeenNthCalledWith(2, '--chat-viewport-offset-top', '0px');

    targetWindow.innerHeight = 640;
    targetWindow.dispatchEvent(new Event('resize'));
    expect(rootStyle.setProperty).toHaveBeenNthCalledWith(3, '--chat-viewport-height', '640px');
    expect(rootStyle.setProperty).toHaveBeenNthCalledWith(4, '--chat-viewport-offset-top', '0px');

    cleanup();
  });
});
