export const stringToInt = (input: string): number => {
  let negative = false;
  const unsigned = input.trim().toUpperCase();
  let signed: string;
  if (unsigned === '') {
    return 0;
  }
  if (unsigned[0] === '-') {
    negative = true;
    signed = unsigned.substr(1);
  } else {
    signed = unsigned;
  }

  let result:number;
  // look for hex suffix
  if (signed.endsWith('H')) {
    result = parseInt(signed.substr(0, signed.length - 1), 16);
  } else if (signed.startsWith('0X')) {
    // look for hex prefix
    result = parseInt(signed.substr(2), 16);
  } else {
    result = parseInt(signed, 10);
  }

  return negative
    ? -result
    : result;
};
