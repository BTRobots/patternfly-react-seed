import { MAX_PROGRAM_LENGTH } from '../constants';
import { PrecompiledLine, Program } from '../types';

export const checkProgramLength = (program: PrecompiledLine[]) => {
  if (program.length > MAX_PROGRAM_LENGTH) {
    throw new Error(`Program is ${program.length - MAX_PROGRAM_LENGTH} lines too long: maximum program length is ${MAX_PROGRAM_LENGTH} compiled lines`);
  }
};
