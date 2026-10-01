import { render } from '@testing-library/react-native';
import type { ReactNode, Ref } from 'react';

import { Sheet } from '../Sheet';
import { Text } from '../Text';

const mockPresent = jest.fn();
const mockDismiss = jest.fn();
let mockOnDismiss: (() => void) | undefined;

jest.mock('@gorhom/bottom-sheet', () => {
  const actual = jest.requireActual('@gorhom/bottom-sheet/mock');
  const { forwardRef, useImperativeHandle } = jest.requireActual('react');
  return {
    ...actual,
    BottomSheetModal: forwardRef(function MockModal(
      props: { children: ReactNode; onDismiss?: () => void },
      ref: Ref<unknown>,
    ) {
      mockOnDismiss = props.onDismiss;
      useImperativeHandle(ref, () => ({ present: mockPresent, dismiss: mockDismiss }));
      return props.children;
    }),
  };
});

describe('Sheet', () => {
  beforeEach(() => {
    mockPresent.mockClear();
    mockDismiss.mockClear();
  });

  const renderSheet = (open: boolean, onClose = jest.fn()) =>
    render(
      <Sheet open={open} onClose={onClose} title="Filtros">
        <Text>conteúdo</Text>
      </Sheet>,
    );

  it('never dismisses a sheet that was not presented (regression)', () => {
    renderSheet(false);
    expect(mockDismiss).not.toHaveBeenCalled();
    expect(mockPresent).not.toHaveBeenCalled();
  });

  it('presents on open and dismisses on close', () => {
    const { rerender } = renderSheet(false);
    rerender(
      <Sheet open onClose={jest.fn()}>
        <Text>conteúdo</Text>
      </Sheet>,
    );
    expect(mockPresent).toHaveBeenCalledTimes(1);
    rerender(
      <Sheet open={false} onClose={jest.fn()}>
        <Text>conteúdo</Text>
      </Sheet>,
    );
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not dismiss again after the user closes it, and can reopen', () => {
    const onClose = jest.fn();
    const { rerender } = render(
      <Sheet open onClose={onClose}>
        <Text>conteúdo</Text>
      </Sheet>,
    );
    mockOnDismiss?.(); // user swiped it down
    expect(onClose).toHaveBeenCalled();
    rerender(
      <Sheet open={false} onClose={onClose}>
        <Text>conteúdo</Text>
      </Sheet>,
    );
    expect(mockDismiss).not.toHaveBeenCalled();
    rerender(
      <Sheet open onClose={onClose}>
        <Text>conteúdo</Text>
      </Sheet>,
    );
    expect(mockPresent).toHaveBeenCalledTimes(2);
  });
});
