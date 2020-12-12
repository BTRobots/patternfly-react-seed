import { operand } from './operand';

describe('operand', () => {
  const suffix = 0;
  it('should return the correct operand prefix for 0', () => {
    expect(operand(suffix, 0)).toEqual('0');
  });
  it('should return the correct operand prefix for 1', () => {
    expect(operand(suffix, 1)).toEqual('@0');
  });
  it('should return the correct operand prefix for 2', () => {
    expect(operand(suffix, 2)).toEqual(':0');
  });
  it('should return the correct operand prefix for 3', () => {
    expect(operand(suffix, 3)).toEqual('$0');
  });
  it('should return the correct operand prefix for 4', () => {
    expect(operand(suffix, 4)).toEqual('!0');
  });
  it('should return the correct operand prefix for 5', () => {
    expect(operand(suffix, 5)).toEqual('0');
  });
  it('should return the correct operand prefix for 6', () => {
    expect(operand(suffix, 6)).toEqual('0');
  });
  it('should return the correct operand prefix for 7', () => {
    expect(operand(suffix, 7)).toEqual('0');
  });
  it('should return the correct operand prefix for 8', () => {
    expect(operand(suffix, 8)).toEqual('[0]');
  });
  it('should return the correct operand prefix for 9', () => {
    expect(operand(suffix, 9)).toEqual('[@0]');
  });
  it('should return the correct operand prefix for 10', () => {
    expect(operand(suffix, 10)).toEqual('[:0]');
  });
  it('should return the correct operand prefix for 11', () => {
    expect(operand(suffix, 11)).toEqual('[$0]');
  });
  it('should return the correct operand prefix for 12', () => {
    expect(operand(suffix, 12)).toEqual('[!0]');
  });
  it('should return the correct operand prefix for 13', () => {
    expect(operand(suffix, 13)).toEqual('[0]');
  });
  it('should return the correct operand prefix for 14', () => {
    expect(operand(suffix, 14)).toEqual('[0]');
  });
  it('should return the correct operand prefix for 15', () => {
    expect(operand(suffix, 15)).toEqual('[0]');
  });
  it('should return the correct operand prefix for 16', () => {
    expect(operand(suffix, 16)).toEqual('0');
  });
});
