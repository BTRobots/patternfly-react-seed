import { replaceInvalidCharacters } from './replaceInvalidCharacters';

describe('replaceInvalidCharacters',  () => {
  it('should remove all characters from a string which character codes < 32 and > 127', () => {
    const numArray: number[] = [];
    for (let i = 0; i < 256; numArray[i] = i++);
    const testCase: string = numArray.map(num => String.fromCharCode(num)).join('');
    const expected: string = numArray.map(num => (num > 31 && num < 128 ? String.fromCharCode(num) : ' ')).join('');
    expect(replaceInvalidCharacters(testCase)).toEqual(expected);
  });
});
