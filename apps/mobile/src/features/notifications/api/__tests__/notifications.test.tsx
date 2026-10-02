import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createWrapper, useFreshMocks } from '../../../../../__tests__/utils/query';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationsCount,
} from '..';

describe('notification hooks', () => {
  useFreshMocks();

  it('marks one and then all notifications as read', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => ({
        list: useNotifications(),
        unread: useUnreadNotificationsCount(),
        markOne: useMarkNotificationRead(),
        markAll: useMarkAllNotificationsRead(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.unread.data).toBe(4));
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    const unread = result.current.list.data!.pages[0]!.items.find((item) => item.readAt === null)!;

    await act(() => result.current.markOne.mutateAsync(unread.id));
    await waitFor(() => expect(result.current.unread.data).toBe(3));

    await act(() => result.current.markAll.mutateAsync());
    await waitFor(() => expect(result.current.unread.data).toBe(0));
    expect(result.current.list.data!.pages[0]!.items.every((item) => item.readAt !== null)).toBe(
      true,
    );
  });
});
