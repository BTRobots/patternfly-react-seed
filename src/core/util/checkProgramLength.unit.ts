import { MAX_PROGRAM_LENGTH } from '../constants';
import { checkProgramLength } from './checkProgramLength';

describe('checkProgramLength', () => {
  it(`should throw if program is longer than ${MAX_PROGRAM_LENGTH} compiled lines`, () => {
    expect(() => checkProgramLength(new Array(MAX_PROGRAM_LENGTH + 1))).toThrow();
  });
  it(`should not throw if program is <= ${MAX_PROGRAM_LENGTH} compiled lines`, () => {
    expect(() => checkProgramLength(new Array(MAX_PROGRAM_LENGTH))).not.toThrow();
    expect(() => checkProgramLength([])).not.toThrow();
  });
});
