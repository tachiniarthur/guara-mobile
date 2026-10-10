import { usePathname, useRouter, type Href } from 'expo-router';

import { useChatDocked } from '@/hooks/useChatDocked';
import { conversationHref, isChatPath } from '@/navigation/destinations';

import { useChatStore } from '../store';

/** Route of the chat opened over a page (phones and narrower tablets). */
export const CHAT_PANEL_HREF = '/chat-panel' as const;

/**
 * "Chat em qualquer tela": the chat opens over the current page (a sheet on phones, a panel on
 * the right on tablets, docked beside the pages on wide tablets), goes full screen and comes back.
 */
export function useChatNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const docked = useChatDocked();
  const openPanel = useChatStore((state) => state.openPanel);
  const showHistory = useChatStore((state) => state.showHistory);
  const setOrigin = useChatStore((state) => state.setOrigin);

  const openOverPage = () => {
    if (docked) openPanel('conversation');
    else router.push(CHAT_PANEL_HREF);
  };

  return {
    /** "Conversar": the chat over the current page. */
    open: () => {
      if (!isChatPath(pathname)) setOrigin(pathname);
      openOverPage();
    },
    /** "Abrir em tela cheia". */
    openFullScreen: () => {
      if (docked) router.navigate(conversationHref());
      // Leaves the panel and goes to the conversation tab, without stacking a second tab bar.
      else router.dismissTo(conversationHref());
    },
    /** "Histórico de conversas". */
    openHistory: () => {
      if (docked) showHistory();
      else router.dismissTo('/chat');
    },
    /** "Sair da tela cheia": back to the page under the chat, with the chat open over it. */
    exitFullScreen: () => {
      router.navigate((useChatStore.getState().origin ?? '/') as Href);
      openOverPage();
    },
  };
}
