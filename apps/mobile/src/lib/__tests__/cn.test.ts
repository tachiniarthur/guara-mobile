import { cn } from '../cn';

describe('cn', () => {
  it('keeps font size and text color together', () => {
    expect(cn('text-15 text-foreground')).toBe('text-15 text-foreground');
  });

  it('resolves conflicts within the same group', () => {
    expect(cn('text-13', 'text-15')).toBe('text-15');
    expect(cn('text-foreground', 'text-negative')).toBe('text-negative');
    expect(cn('font-sans', 'font-serif-extrabold')).toBe('font-serif-extrabold');
    expect(cn('rounded-24', 'rounded-full')).toBe('rounded-full');
    expect(cn('h-control-md', 'h-control-lg')).toBe('h-control-lg');
    expect(cn('min-h-touch', 'min-h-control-lg')).toBe('min-h-control-lg');
    expect(cn('bg-brand', 'bg-negative')).toBe('bg-negative');
  });

  it('handles conditionals', () => {
    expect(cn('p-4', false && 'p-2', undefined, ['rounded-24'])).toBe('p-4 rounded-24');
  });
});
