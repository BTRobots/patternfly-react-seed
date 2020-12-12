import {
  Command,
} from './types';
import {
  operand,
} from './operand';
import {
  getOperationFromCode,
} from './OperationCodeMap';

export const mnemonic = (n: number, m: number): string =>
  m === 0
    ? getOperationFromCode(n)
    : operand(n, m);
