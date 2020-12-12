/**
 * Replaces invalid characters with spaces
 */
export const replaceInvalidCharacters = (input: string):string => {
  return input
    .split('') // split to character array
    .filter(Boolean)
    .map((char) => {
      const charCode = char.charCodeAt(0); // to ascii number
      return (
        charCode < 32 ||
        charCode > 127
      )
        ? ' '
        : char;
    })
    .reduce((acc, curr) => acc + curr, ''); // join array
};
