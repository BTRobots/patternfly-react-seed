import { CompiledLine } from '../types';

export const isMicrocodeValid = (index: number, microcode: number): boolean => {
  return ![0, 1, 2, 4].includes((microcode >> (index << 2)) & 7);
};

export const isMicrocodeValidForLine = (line: CompiledLine):boolean => {
  return line.every(isMicrocodeValid);
};
