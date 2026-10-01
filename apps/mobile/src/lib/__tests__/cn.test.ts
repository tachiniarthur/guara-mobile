import { cn } from '../cn';

describe('cn', () => {
  it('keeps font size and text color together', () => {
    expect(cn('text-body text-foreground')).toBe('text-body text-foreground');
  });

  it('resolves conflicts within the same group', () => {
    expect(cn('text-body', 'text-title')).toBe('text-title');
    expect(cn('text-foreground', 'text-negative')).toBe('text-negative');
    expect(cn('font-sans', 'font-sans-semibold')).toBe('font-sans-semibold');
    expect(cn('h-control-md', 'h-control-lg')).toBe('h-control-lg');
    expect(cn('min-h-touch', 'min-h-control-lg')).toBe('min-h-control-lg');
    expect(cn('bg-brand-solid', 'bg-negative-solid')).toBe('bg-negative-solid');
  });

  it('handles conditionals', () => {
    expect(cn('p-4', false && 'p-2', undefined, ['rounded-lg'])).toBe('p-4 rounded-lg');
  });
});
