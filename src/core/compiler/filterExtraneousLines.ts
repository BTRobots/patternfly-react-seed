export const filterExtraneousLines = (line: string) => {
  const trimmed = line.trim();
  return trimmed.length > 0 &&
         trimmed[0] !== ';';
};
