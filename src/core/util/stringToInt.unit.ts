import { stringToInt } from './stringToInt';

describe('stringToInt', () => {
  it('should correctly convert empty strings to zero (0)', () => {
    expect(stringToInt('')).toEqual(0);
  });
  it('should correctly convert negative numbers', () => {
    expect(stringToInt('-123')).toEqual(-123);
  });

  it('should correctly convert integer strings', () => {
    expect(stringToInt('2345')).toEqual(2345);
  });

  it('should correctly convert "0X"-prefixed hexidecimal strings', () => {
    expect(stringToInt('0x123')).toEqual(0x123);
    expect(stringToInt('0X123')).toEqual(0x123);

  });

  it('should correctly convert "H"-suffixed hexidecimal strings', () => {
    expect(stringToInt('123h')).toEqual(0x123);
    expect(stringToInt('123H')).toEqual(0x123);
  });
});
