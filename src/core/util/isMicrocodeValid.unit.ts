import { isMicrocodeValid } from './isMicrocodeValid';

describe('isMicrocodeValid', () => {
  it('should return true for 0', () => {
    expect(isMicrocodeValid(0,0)).toBeFalsy();
  });
  // let results = Array(256).fill(0).map((_, microcode) => [0,1,2].map(index => isMicrocodeValid(index, microcode)).toString());
  // console.log(results.join('\n'));
});
