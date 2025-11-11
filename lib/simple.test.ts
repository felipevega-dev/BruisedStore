import { describe, it, expect } from 'vitest';
import { formatPrice } from './utils';

describe('Simple Test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });

  it('should format price', () => {
    const result = formatPrice(50000);
    expect(result).toBe('$50.000');
  });
});
