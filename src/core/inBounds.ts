export const lowerUpperBounds = (input: number, lower: number, upper: number): number =>
  input < lower
    ? lower
    : input > upper
      ? upper
      : input;

export const lowerUpperDefault = (input: number, lower: number, upper: number, def: number): number =>
  input < lower || input > upper
  ? def
  : input;
