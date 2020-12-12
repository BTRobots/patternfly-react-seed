import { MAX_INT, MIN_INT } from '../constants';

export const numberIsInBounds = (n: number): boolean => {
  try {
    return n <= MAX_INT && n >= MIN_INT;
  } catch (err) {
    return false;
  }
};
