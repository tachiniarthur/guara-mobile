import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createApiTransport, setTransport } from '@/lib/api';
import { createMockTransport } from '@/mocks';

import { createWrapper, deferred, useFreshMocks } from '../../../../../__tests__/utils/query';
import { useCorrectCategory, useTransactions } from '..';

describe('transaction hooks', () => {
  useFreshMocks();

  it('loads transactions page by page', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useTransactions(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0]?.items).toHaveLength(20);
    expect(result.current.hasNextPage).toBe(true);

    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
    const ids = result.current.data!.pages.flatMap((page) => page.items.map((tx) => tx.id));
    expect(new Set(ids).size).toBe(40);
  });

  it('applies filters', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useTransactions({ categoryId: 'salary', direction: 'in' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const items = result.current.data!.pages[0]!.items;
    expect(items).toHaveLength(6);
    expect(items.every((tx) => tx.categoryId === 'salary')).toBe(true);
  });

  it('corrects a category optimistically and rolls back on error', async () => {
    // Real mock data, except that the correction waits and then fails.
    const mock = createMockTransport();
    const failure = deferred();
    setTransport(
      createApiTransport({
        ...mock,
        request: async (name, request, options) => {
          if (name !== 'transactions.correctCategory') return mock.request(name, request, options);
          await failure.promise;
          return mock.request(name, request, options);
        },
      }),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => ({ list: useTransactions(), correct: useCorrectCategory() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    const target = result.current.list.data!.pages[0]!.items.find(
      (tx) => tx.categoryId !== 'travel' && tx.direction === 'out',
    )!;
    const categoryOf = () =>
      result.current.list.data!.pages[0]!.items.find((tx) => tx.id === target.id)!.categoryId;

    act(() => {
      result.current.correct.mutate({ transactionId: target.id, categoryId: 'travel' });
    });
    await waitFor(() => expect(categoryOf()).toBe('travel'));

    await act(async () => {
      failure.reject(new Error('boom'));
    });
    await waitFor(() => expect(result.current.correct.isError).toBe(true));
    expect(categoryOf()).toBe(target.categoryId);
  });

  it('keeps the correction when the API accepts it', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => ({ list: useTransactions(), correct: useCorrectCategory() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    const target = result.current.list.data!.pages[0]!.items.find(
      (tx) => tx.categoryId !== 'pets',
    )!;
    await act(() =>
      result.current.correct.mutateAsync({ transactionId: target.id, categoryId: 'pets' }),
    );
    await waitFor(() =>
      expect(
        result.current.list.data!.pages[0]!.items.find((tx) => tx.id === target.id),
      ).toMatchObject({
        categoryId: 'pets',
        userCategoryId: 'pets',
      }),
    );
  });
});
