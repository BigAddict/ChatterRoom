interface VisualViewportTarget extends EventTarget {
  height: number;
  offsetTop: number;
}

interface ChatWindowTarget extends EventTarget {
  innerHeight: number;
  visualViewport: VisualViewportTarget | null;
}

type RootStyle = Pick<CSSStyleDeclaration, 'setProperty' | 'removeProperty'>;

export const observeChatViewport = (
  rootStyle: RootStyle,
  targetWindow: ChatWindowTarget,
): (() => void) => {
  const visualViewport = targetWindow.visualViewport;
  const updateViewport = () => {
    rootStyle.setProperty(
      '--chat-viewport-height',
      `${visualViewport?.height ?? targetWindow.innerHeight}px`,
    );
    rootStyle.setProperty('--chat-viewport-offset-top', `${visualViewport?.offsetTop ?? 0}px`);
  };

  updateViewport();
  targetWindow.addEventListener('resize', updateViewport);
  visualViewport?.addEventListener('resize', updateViewport);
  visualViewport?.addEventListener('scroll', updateViewport);

  return () => {
    targetWindow.removeEventListener('resize', updateViewport);
    visualViewport?.removeEventListener('resize', updateViewport);
    visualViewport?.removeEventListener('scroll', updateViewport);
    rootStyle.removeProperty('--chat-viewport-height');
    rootStyle.removeProperty('--chat-viewport-offset-top');
  };
};
