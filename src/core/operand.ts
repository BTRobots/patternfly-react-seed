/**
    Microcode:
        0 = instruction, number, constant
        1 = variable, memory access
        2 = :label
        3 = !label (unresolved)
        4 = !label (resolved)
       8h mask = inderect addressing (enclosed in [])
*/
export const operand = (suffix: number, prefix: number): string => {
  let operandPrefix: '@' | ':' | '$' | '!' | '' = '';
  // Bitwise AND 7
  switch (prefix & 0b111) {
    case 1:
      operandPrefix = '@';
      break;
    case 2:
      operandPrefix = ':';
      break;
    case 3:
      operandPrefix = '$';
      break;
    case 4:
      operandPrefix = '!';
      break;
  }
  let operand: string = `${operandPrefix}${suffix}`;
  // Bitwise AND 8
  if ((prefix & 0b1000) > 0) {
    operand = `[${operand}]`;
  }
  return operand;
}
