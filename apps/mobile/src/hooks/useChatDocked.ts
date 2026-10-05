import { navigationSize } from '@guara/ui-tokens';

import { useBreakpoint } from './useBreakpoint';

/** Wide tablets show the chat as a side panel (fixed width) instead of a full-screen page. */
export function useChatDocked(): boolean {
  const { isTablet, width } = useBreakpoint();
  return isTablet && width >= navigationSize.chatPanelMinWindow;
}
