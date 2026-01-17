import { describe, it, expect } from 'vitest';
import { clamp } from '../src/js/utils/clamp';

describe('clamp', () => {
  it('should clamp values correctly', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(20, 0, 10)).toBe(10);
  });
});
