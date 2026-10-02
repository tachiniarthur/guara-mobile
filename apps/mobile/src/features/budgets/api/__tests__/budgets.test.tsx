import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createWrapper, useFreshMocks } from '../../../../../__tests__/utils/query';
import { useBudgets, useCreateBudget, useDeleteBudget } from '..';

describe('budget hooks', () => {
  useFreshMocks();

  it('reads the caps of the current month', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useBudgets(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.month).toBe('2026-09');
    expect(result.current.data?.items.map((item) => item.status).sort()).toEqual([
      'exceeded',
      'ok',
      'ok',
      'warning',
    ]);
  });

  it('creates and deletes a cap, refreshing the list', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => ({ list: useBudgets(), create: useCreateBudget(), remove: useDeleteBudget() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.data?.items).toHaveLength(4));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create.mutateAsync({
        categoryId: 'leisure',
        limit: 40_000,
        warningThresholds: [80],
      });
      createdId = created.id;
    });
    await waitFor(() => expect(result.current.list.data?.items).toHaveLength(5));

    await act(() => result.current.remove.mutateAsync(createdId));
    await waitFor(() => expect(result.current.list.data?.items).toHaveLength(4));
  });

  it('surfaces API errors on the mutation', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateBudget(), { wrapper });
    await act(async () => {
      await result.current
        .mutateAsync({ categoryId: 'groceries', limit: 1_000, warningThresholds: [] })
        .catch(() => undefined);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      code: 'conflict',
      message: 'Já existe um teto para Mercado.',
    });
  });
});
