import { numberIsInBounds } from './numberIsInBounds';
import { MIN_INT, MAX_INT } from '../constants';
describe('numberIsInBounds', () => {
  it('should return true if in bounds', () => {
    expect(numberIsInBounds(123)).toBe(true);
    expect(numberIsInBounds(MIN_INT)).toBe(true);
    expect(numberIsInBounds(MAX_INT)).toBe(true);
  });
  it('should return false if < MIN_INT', () => {
    expect(numberIsInBounds(MIN_INT - 1)).toBe(false);
  });
  it('should return true if > MAX_INT', () => {
    expect(numberIsInBounds(MAX_INT + 1)).toBe(false);
  });
  it('should return false if invalid input', () => {
    expect(numberIsInBounds('abc' as any as number)).toBe(false);
  });
});
