import { filterExtraneousLines } from './filterExtraneousLines';
describe('filterExtraneousLines', () => {
  it('should remove empty lines from a multi-line string', () => {
    const testCase = `


123

   456

;345
    `.split(/\n/g);

    expect(testCase.filter(filterExtraneousLines)).toEqual(['123', '   456']);
  });
});
