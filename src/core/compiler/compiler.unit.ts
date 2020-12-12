import { compile, CompilerInput } from './compile';
import { createEmptyCompiledProgram } from '../testUtils/createEmptyProgram';
import { MAX_VAR_LEN, VARS_SIZE, LABELS_SIZE } from '../constants';
import { Robot, ProgramLine } from '../types';

const getCompilerInput = (st: string):CompilerInput => ({
  robot_file: st,
});

describe('compiler', () => {
  describe('comment lines', () => {
    const testCase = getCompilerInput(`
    ;
    ; This is a test header!
    ;
    ; This should comile to zero lines!
    ;
    `);
    // const expected = createEmptyCompiledProgram();
    // this test currently will break all other tests
    // it('should throw with just comment lines', () => {
    //   expect(() => compile(testCase)).toThrow();
    // });
  });
  describe('directives', () => {
    describe('DEF', () => {
      it('should throw if the variable name is too long', () => {
        const testCase = getCompilerInput(`
        #def thisnameistoolong
        `);
        expect(() => compile(testCase)).toThrow();
      });
      it('should throw if a variable is being redeclared', () => {
        const testCase = getCompilerInput(`
        #def test
        #def test
        `);
        expect(() => compile(testCase)).toThrow();
      });
      it('should compile lowercase defs', () => {
        const testCase = getCompilerInput(`
        #def lowercasename
        `);
        expect(() => compile(testCase)).not.toThrow();
      });
      it('should compile uppercase defs', () => {
        const testCase = getCompilerInput(`
        #DEF UPPERCASENAME
        `);
        expect(() => compile(testCase)).not.toThrow();
      });
      it('should not throw when the maximum number variables have been declared', () => {
        const testCase = getCompilerInput((new Array(VARS_SIZE)).fill('').map((val, index) => `#def variable${index}`).join('\n'));
        expect(() => compile(testCase)).not.toThrow();
      });
      it('should throw when too many variables have been declared', () => {
        const testCase = getCompilerInput((new Array(VARS_SIZE + 1)).fill('').map((val, index) => `#def variable${index}`).join('\n'));
        expect(() => compile(testCase)).toThrow();
      });
    });
    describe('LOCK', () => {
      it('should not throw when passed uppercase LOCK', () => {
        const testCase = getCompilerInput(`
        #LOCK
        `);
        expect(() => compile(testCase)).not.toThrow();
      });
      it('should not throw when passed lowercase LOCK', () => {
        const testCase = getCompilerInput(`
        #lock
        `);
        expect(() => compile(testCase)).not.toThrow();
      });
    });
    describe('MSG', () => {
      it('should not throw when passed lowercase msg', () => {
        const expected = "Here's the message";
        const testCase = getCompilerInput(`
        #msg ${expected}
        `);
        expect(() => compile(testCase)).not.toThrow();
      });
      it('should not throw when passed lowercase msg', () => {
        const expected = "Here's the message";
        const testCase = getCompilerInput(`
        #MSG ${expected}
        `);
        expect(() => compile(testCase)).not.toThrow();
      });
      it('should set the robot.name parameter', () => {
        const expected = "Here's the message";
        const testCase = getCompilerInput(`
        #msg ${expected}
        `);
        expect(compile(testCase).robot_config.name).toEqual(expected);
      });
    });
    describe('TIME', () => {
      it('should set the robot.robot_time_limit parameter', () => {
        const expected = 25;
        const testCase = getCompilerInput(`
        #time ${expected}
        `);
        expect(compile(testCase).robot_config.robot_time_limit).toEqual(expected);
      });
      it('should set the robot.robot_time_limit parameter to a minimum of zero', () => {
        const expected = -25;
        const testCase = getCompilerInput(`
        #time ${expected}
        `);
        expect(compile(testCase).robot_config.robot_time_limit).toEqual(0);
      });
    });
    describe('CONFIG', () => {
      // common config values with the same rules
      const configKeys = ([
        'scanner',
        'shield',
        'weapon',
        'armor',
        'engine',
        'heatsinks',
        'mines',
      ] as (keyof Robot.Config)[]).forEach((key) => {
        describe(key.toUpperCase(), () => {
          it(`should set the robot.${key} config parameter`, () => {
            expect(compile(getCompilerInput((`#config ${key}=2`))).robot_config[key]).toEqual(2);
          });
          it('should set the robot.${key} config parameter to a minimum of 0', () => {
            expect(compile(getCompilerInput(`#config ${key}=-2`)).robot_config[key]).toEqual(0);
          });
          it('should set the robot.${key} config parameter to a maximum of 5', () => {
            expect(compile(getCompilerInput(`#config ${key}=6`)).robot_config[key]).toEqual(5);
          });
        });
      });
      describe('invalid setting', () => {
        it('should throw with an invalid setting', () => {
          expect(() => compile(getCompilerInput('#config somegarbage=6'))).toThrow();
        });
      });
    });
  });
  describe('pre-compiled machine code', () => {
    it('should throw if more than one asterisk is on each line', () => {
      expect(() => compile(getCompilerInput('** 12 34 45'))).toThrow();
      expect(() => compile(getCompilerInput('* 12 34 45*'))).toThrow();
      expect(() => compile(getCompilerInput('* 12 34* 45'))).toThrow();
    });
    it('should throw if there is only one character in the int tuple', () => {
      expect(() => compile(getCompilerInput('*1'))).toThrow();
    });
    [
      {
        input: '* 1 2',
        expectedOutput: [1, 2, 0, 0],
      },
      {
        input: '* 1 2 0',
        expectedOutput: [1, 2, 0, 0],
      },
      {
        input: '* 1 2 0 0',
        expectedOutput: [1, 2, 0, 0],
      },
      {
        input: '* 1 2 3',
        expectedOutput: [1, 2, 3, 0],
      },
      {
        input: '* 1 2 3 4',
        expectedOutput: [1, 2, 3, 4],
      },
      {
        input: '* 11 2 3 4',
        expectedOutput: [11, 2, 3, 4],
      },
      {
        input: '* 11 232 3 43',
        expectedOutput: [11, 232, 3, 43],
      },
      {
        input: '* 0 00 3 43',
        expectedOutput: [0, 0, 3, 43],
      },
    ].forEach(({ input, expectedOutput }) => {
      it(`should return the correct output for the tuple ${input}`, () => {
        expect(compile(getCompilerInput(input)).robot_config.program).toEqual([expectedOutput]);
      });
    });
  });
  describe(':labels', () => {
    it('should error if a non-digit character is given', () => {
      expect(() => compile(getCompilerInput(':123a'))).toThrow();
    });
    it('should return the correct tuple', () => {
      expect(compile({
        ...getCompilerInput(':12334'),
        // debug_logging: true,
      }).robot_config.program).toEqual([[12334, 0, 0, 2]]);
    });
  });
  describe('!labels', () => {
    it('should error if redeclaring a !label', () => {
      expect(() => compile({
        ...getCompilerInput(`
          !somelabel
          !somelabel
          mov   ax       1
        `),
        // debug_logging:true,
      })).toThrow();
    });
    it('should error if too many !labels are declared', () => {
      expect(() => compile(getCompilerInput(Array(LABELS_SIZE + 1).fill('').map((v, i) => `somelabel${i}`).join('\n')))).toThrow();
    });
    it('should return the correct compiled code', () => {
      expect(compile({ ...getCompilerInput(`
        !start
        mov   ax       1
        int   i_keepshift
        opo   p_throttle 100
        call  !start
      `),
        // debug_logging: true,
      }).robot_config.program).toEqual([
        [22, 65, 1, 16],
        [26, 3, 0, 0],
        [28, 11, 100, 0],
        [11, 0, 0, 64],
      ]);
    });
    it('should replace unresolved labels', () => {
      expect(compile({ ...getCompilerInput(`
        call  !start
        mov   ax       2
        !start
        mov   ax       1
        int   i_keepshift
        opo   p_throttle 100
      `),
        // debug_logging: true,
      }).robot_config.program).toEqual([
        [11, 2, 0, 64],
        [22, 65, 2, 16],
        [22, 65, 1, 16],
        [26, 3, 0, 0],
        [28, 11, 100, 0],
      ]);
    });
  });
  describe('parsing instructions', () => {

  });
});
