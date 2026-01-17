import { describe, it, expect } from 'vitest';
import { getValue } from '../src/js/components/unitValue';

describe('unit value default', () => {
  it('default value is 1.0', () => {
    expect(getValue()).toBe(1.0);
  });
});
