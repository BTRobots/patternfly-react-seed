import { MAX_OP } from '../constants';
import { CompiledLine } from '../types';

export const isMicrocodeValid = (index: number, microcode: number): boolean => {
  let valid = true;
  for (let i = 0; i < 2; i++) {
    
  }
  return valid;
  // return ![0, 1, 2, 4].includes((microcode >> (index << 2)) & 7);
};

export const isMicrocodeValidForLine = (line: CompiledLine):boolean => {
  let valid = true;
  for (let i = 0; i < 2; i++) {
    const tmp = (line[MAX_OP] >> (i << 2)) & 7;
    if (![0, 1, 2, 4].includes(tmp)) {
      valid = false;
      break;
    }
  }
  return valid;
  // return line.every(isMicrocodeValid);
};
