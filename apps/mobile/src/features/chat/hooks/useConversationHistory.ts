import { normalizeForSearch } from '@guara/utils';

import { countConversations, historyGroups } from '../data';
import { useChatStore } from '../store';

/** The history (pinned first), filtered by the search, and how many conversations there are. */
export function useConversationHistory(query: string) {
  const groups = useChatStore((state) => state.groups);
  const needle = normalizeForSearch(query);
  const filtered = historyGroups(groups)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        normalizeForSearch(`${item.title} ${item.preview}`).includes(needle),
      ),
    }))
    .filter((group) => group.items.length > 0);
  return { groups: filtered, count: countConversations(groups) };
}
