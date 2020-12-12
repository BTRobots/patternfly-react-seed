import { compile } from './compile';
import { DebuggingSymbols, Robot } from '../types';

describe('test01', () => {
  const robot_file = `
  
  `;
  const expectedOutput: Robot.Config = {

  };
  let robot_config: Robot.Config = null;
  let debug_symbols: DebuggingSymbols = [];
  let error = null;
  beforeAll(() => {
    try {
      const result = compile({
        robot_file,
      });
      robot_config = result.robot_config;
    } catch (err) {
      error = err;
    }
  })

  
  it('should set the correct', () => {
    expect(robot_config.armor)
  })
  it('should output the correct code', () => {
    expect(robot_config).toEqual(expectedOutput);
  });
});
