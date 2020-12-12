import {
  isEmptyLine,
  isBangLabelLine,
  isColonLabelLine,
  isCommentLine,
  isDirectiveLine,
  isOperationLine,
  isPreCompiledLine,
  getLineType,
  isColonLabelLineValid,
  isBangLabelLineValid,
  isPreCompiledLineValid,
  isDirectiveLineValid,
} from './lineUtils';
import { LineType, ProgramWord, DirectiveType, ConfigurationType } from '../types';

describe('lineUtils', () => {
  type TestCase = {
    lineType: LineType;
    name: string;
    input: string;
    valid: boolean;
    parsed: null |
      boolean |
      [ProgramWord] |
      [ProgramWord, ProgramWord] |
      [ProgramWord, ProgramWord, ProgramWord] |
      [ProgramWord, ProgramWord, ProgramWord, ProgramWord];
  };
  const testC = [
    {
      lineType: LineType.EMPTY,
      name: 'line',
      input: '',
      valid: true,
    },
    {
      lineType: LineType.EMPTY,
      name: 'spaceLine',
      input: '     ',
      valid: true,
    },
    {
      lineType: LineType.COMMENT,
      name: 'emptyLine',
      input: ';',
      valid: true,
    },
    {
      lineType: LineType.COMMENT,
      name: 'line',
      input: '; This is a line that only contains a comment',
      valid: true,
    },
    {
      lineType: LineType.COMMENT,
      name: 'leadingSpaceLine',
      input: '     ; This is a line that only contains a comment',
      valid: true,
    },
    {
      lineType: LineType.COMMENT,
      name: 'trailingSpaceLine',
      input: ';This is a line that only contains a comment       ',
      valid: true,
    },
    {
      lineType: LineType.COMMENT,
      name: 'leadingAndTrailingSpaceLine',
      input: '       ; This is a line that only contains a comment       ',
      valid: true,
    },
    {
      lineType: LineType.DIRECTIVE,
      name: 'space',
      input: '# def',
      valid: false,
    },
    {
      lineType: LineType.DIRECTIVE,
      name: 'defLower',
      input: '#def test123',
      valid: true,
      parsed: [DirectiveType.VARIABLE_DECLARATION, 'test123'],
    },
    {
      lineType: LineType.DIRECTIVE,
      name: 'defUpper',
      input: '#DEF test123',
      valid: true,
      parsed: [DirectiveType.VARIABLE_DECLARATION, 'test123'],
    },
    {
      lineType: LineType.DIRECTIVE,
      name: 'defUpper',
      input: '#DeF test123',
      valid: true,
      parsed: [DirectiveType.VARIABLE_DECLARATION, 'test123'],
    },
    {
      lineType: LineType.DIRECTIVE,
      name: 'lockLower',
      input: '#lock test123',
      valid: true,
      parsed: [DirectiveType.LOCK],
    },
    {
      lineType: LineType.DIRECTIVE,
      name: 'lockUpper',
      input: '#LOCK',
      valid: true,
      parsed: [DirectiveType.VARIABLE_DECLARATION, 'test123'],
    },
    {
      lineType: LineType.DIRECTIVE,
      name: 'lockUpper',
      input: '#LocK',
      valid: true,
      parsed: [DirectiveType.VARIABLE_DECLARATION],
    },
  ];

  const testCases: {[index: string]: string } = {};
  testCases[`${LineType.EMPTY}_line`] = '';
  testCases[`${LineType.EMPTY}_spaceLine`] = '     ';

  testCases[`${LineType.COMMENT}_emptyLine`] = ';',
  testCases[`${LineType.COMMENT}_line`] = '; This is a line that only contains a comment',
  testCases[`${LineType.COMMENT}_leadingSpaceLine`] = '     ; This is a line that only contains a comment',
  testCases[`${LineType.COMMENT}_trailingSpaceLine`] = ';This is a line that only contains a comment       ',
  testCases[`${LineType.COMMENT}_leadingAndTrailingSpaceLine`] = '       ; This is a line that only contains a comment       ',

  testCases[`${LineType.DIRECTIVE}_invalid_space`] = '# def',

  testCases[`${LineType.DIRECTIVE}_defLower`] = '#def test123',
  testCases[`${LineType.DIRECTIVE}_defUpper`] = '#DEF test123',
  testCases[`${LineType.DIRECTIVE}_defMixed`] = '#DeF test123',

  testCases[`${LineType.DIRECTIVE}_lockLower`] = '#lock test123',
  testCases[`${LineType.DIRECTIVE}_lockUpper`] = '#LOCK test123',
  testCases[`${LineType.DIRECTIVE}_lockMixed`] = '#LoCK test123',

  testCases[`${LineType.DIRECTIVE}_msgLower`] = '#msg test123',
  testCases[`${LineType.DIRECTIVE}_msgUpper`] = '#MSG test123',
  testCases[`${LineType.DIRECTIVE}_msgMixed`] = '#MsG test123',

  testCases[`${LineType.DIRECTIVE}_timeLower`] = '#time 123',
  testCases[`${LineType.DIRECTIVE}_timeUpper`] = '#TIME 123',
  testCases[`${LineType.DIRECTIVE}_timeMixed`] = '#TimE 123',
  testCases[`${LineType.DIRECTIVE}_invalid_time`] = '#TIME test123',
  testCases[`${LineType.DIRECTIVE}_invalid_timeZero`] = '#TIME 0',

  testCases[`${LineType.DIRECTIVE}_invalid_configType`] = '#config test123',
  Object.keys(ConfigurationType).forEach((type) => {
    testCases[`${LineType.DIRECTIVE}_configMixed${type}`] = `#ConfiG ${type} 1`;
  });

  testCases[`${LineType.BANG_LABEL}_lower`] = '!somelabel',
  testCases[`${LineType.BANG_LABEL}_upper`] = '!SOMELABLE',
  testCases[`${LineType.BANG_LABEL}_number`] = '!123',
  testCases[`${LineType.BANG_LABEL}_mixed`] = '!someLabel123',
  testCases[`${LineType.BANG_LABEL}_invalid_space`] = '! someLabel123',
  testCases[`${LineType.BANG_LABEL}_invalid_specialChar$`] = '!$someLabel123',
  testCases[`${LineType.BANG_LABEL}_invalid_specialChar!`] = '!someLa!bel123',
  testCases[`${LineType.BANG_LABEL}_invalid_name`] = '!',

  testCases[`${LineType.COLON_LABEL}_min`] = ':0',
  testCases[`${LineType.COLON_LABEL}_max`] = ':32767',
  testCases[`${LineType.COLON_LABEL}_invalid_tooLarge`] = ':32768',
  testCases[`${LineType.COLON_LABEL}_invalid_tooSmall`] = ':-1',
  testCases[`${LineType.COLON_LABEL}_invalid_NaN`] = ':abc',

  testCases[`${LineType.PRE_COMPILED}_space`] = '  *22 84 1 3',
  testCases[`${LineType.PRE_COMPILED}_comma`] = '  *22,84,1,3',
  testCases[`${LineType.PRE_COMPILED}_spaceAndComma`] = '  *22,84 1,3',
  testCases[`${LineType.PRE_COMPILED}_invalid_TooMany`] = '*22 84 1 3 5',
  testCases[`${LineType.PRE_COMPILED}_invalid_TooFew`] = '*22 84',
  testCases[`${LineType.PRE_COMPILED}_invalid_Characters`] = '*22 84 a b',
  testCases[`${LineType.PRE_COMPILED}_invalid_MoreThanOneAsterisk`] = '*22 84 *a b',

  testCases[`${LineType.OPERATION}_0arg`] = 'nop',
  testCases[`${LineType.OPERATION}_1arg`] = 'loop 1',
  testCases[`${LineType.OPERATION}_2arg`] = 'opo p_throttle 0',

  testCases[`${LineType.UNKNOWN}_0`] = '$sdfsd',
  testCases[`${LineType.UNKNOWN}_1`] = ' aaa bbbb',

  describe('isEmptyLine', () => {
    for (const test in testCases) {
      if (test.startsWith(LineType.EMPTY)) {
        it(`should return true for empty line '${testCases[test]}'`, () => {
          expect(isEmptyLine(testCases[test])).toBe(true);
        });
      } else {
        it(`should return false for non-empty line '${testCases[test]}'`, () => {
          expect(isEmptyLine(testCases[test])).toBe(false);
        });
      }
    }
    it('should not throw and return false with bad input', () => {
      expect(isEmptyLine(null as any as string)).toBe(false);
    });
  });

  describe('isCommentLine', () => {
    for (const test in testCases) {
      if (test.startsWith(LineType.COMMENT)) {
        it(`should return true for comment line '${testCases[test]}'`, () => {
          expect(isCommentLine(testCases[test])).toBe(true);
        });
      } else {
        it(`should return false for non-comment line '${testCases[test]}'`, () => {
          expect(isCommentLine(testCases[test])).toBe(false);
        });
      }
    }
    it('should not throw and return false with bad input', () => {
      expect(isCommentLine(null as any as string)).toBe(false);
    });
  });

  describe('isDirectiveLine', () => {
    for (const test in testCases) {
      if (test.startsWith(LineType.DIRECTIVE)) {
        it(`should return true for directive line '${testCases[test]}'`, () => {
          expect(isDirectiveLine(testCases[test])).toBe(true);
        });
      } else {
        it(`should return false for non-directive line '${testCases[test]}'`, () => {
          expect(isDirectiveLine(testCases[test])).toBe(false);
        });
      }
    }
    it('should not throw and return false with bad input', () => {
      expect(isDirectiveLine(null as any as string)).toBe(false);
    });
  });

  describe('isBangLabelLine', () => {
    for (const test in testCases) {
      if (test.startsWith(LineType.BANG_LABEL)) {
        it(`should return true for bangLabel line '${testCases[test]}'`, () => {
          expect(isBangLabelLine(testCases[test])).toBe(true);
        });
      } else {
        it(`should return false for non-bangLabel line '${testCases[test]}'`, () => {
          expect(isBangLabelLine(testCases[test])).toBe(false);
        });
      }
    }
    it('should not throw and return false with bad input', () => {
      expect(isBangLabelLine(null as any as string)).toBe(false);
    });
  });
  describe('isColonLabelLine', () => {
    for (const test in testCases) {
      if (test.startsWith(LineType.COLON_LABEL)) {
        it(`should return true for colonLabel line '${testCases[test]}'`, () => {
          expect(isColonLabelLine(testCases[test])).toBe(true);
        });
      } else {
        it(`should return false for non-colonLabel line '${testCases[test]}'`, () => {
          expect(isColonLabelLine(testCases[test])).toBe(false);
        });
      }
    }
    it('should not throw and return false with bad input', () => {
      expect(isColonLabelLine(null as any as string)).toBe(false);
    });
  });
  describe('isPreCompiledLine', () => {
    for (const test in testCases) {
      if (test.startsWith(LineType.PRE_COMPILED)) {
        it(`should return true for precompiled line '${testCases[test]}'`, () => {
          expect(isPreCompiledLine(testCases[test])).toBe(true);
        });
      } else {
        it(`should return false for non-precompiled line '${testCases[test]}'`, () => {
          expect(isPreCompiledLine(testCases[test])).toBe(false);
        });
      }
    }
    it('should not throw and return false with bad input', () => {
      expect(isPreCompiledLine(null as any as string)).toBe(false);
    });
  });
  describe('isOperationLine', () => {
    for (const test in testCases) {
      if (test.startsWith(LineType.OPERATION)) {
        it(`should return true for operation line '${testCases[test]}'`, () => {
          expect(isOperationLine(testCases[test])).toBe(true);
        });
      } else {
        it(`should return false for non-operation line '${testCases[test]}'`, () => {
          expect(isOperationLine(testCases[test])).toBe(false);
        });
      }
    }
    it('should not throw and return false with bad input', () => {
      expect(isOperationLine(null as any as string)).toBe(false);
    });
  });

  describe('getLineType', () => {
    for (const test in testCases) {
      for (const instructionType in LineType) {
        if (test.startsWith(instructionType)) {
          it(`should return '${instructionType}' for '${testCases[test]}'`, () => {
            expect(getLineType(testCases[test])).toBe(instructionType);
          });
        }
      }
    }
    it(`should not throw and return ${LineType.UNKNOWN} with bad input`, () => {
      expect(getLineType(null as any as string)).toBe(LineType.UNKNOWN);
    });
  });

  describe('Line Parsing', () => {
    describe('parseColonLabelLine', () => {
      for (const test in testCases) {
        if (isColonLabelLine(testCases[test])) {
          const isValid = !test.includes('invalid');
          it(`should return '${isValid}' for '${testCases[test]}'`, () => {
            expect(isColonLabelLineValid(testCases[test])).toBe(isValid);
          });
        }
      }
      it('should not throw and return false with bad input', () => {
        expect(isColonLabelLineValid(null as any as string)).toBe(false);
      });
    })
  });

  describe('Line Validation', () => {
    describe('isColonLabelLineValid', () => {
      for (const test in testCases) {
        if (isColonLabelLine(testCases[test])) {
          const isValid = !test.includes('invalid');
          it(`should return '${isValid}' for '${testCases[test]}'`, () => {
            expect(isColonLabelLineValid(testCases[test])).toBe(isValid);
          });
        }
      }
      it('should not throw and return false with bad input', () => {
        expect(isColonLabelLineValid(null as any as string)).toBe(false);
      });
    });
    describe('isBangLabelLineValid', () => {
      for (const test in testCases) {
        if (isBangLabelLine(testCases[test])) {
          const isValid = !test.includes('invalid');
          it(`should return '${isValid}' for '${testCases[test]}'`, () => {
            expect(isBangLabelLineValid(testCases[test])).toBe(isValid);
          });
        }
      }
      it('should not throw and return false with bad input', () => {
        expect(isBangLabelLineValid(null as any as string)).toBe(false);
      });
    });

    describe('isPreCompiledLineValid', () => {
      for (const test in testCases) {
        if (isPreCompiledLine(testCases[test])) {
          const isValid = !test.includes('invalid');
          it(`should return '${isValid}' for '${testCases[test]}'`, () => {
            expect(isPreCompiledLineValid(testCases[test])).toBe(isValid);
          });
        }
      }
      it('should not throw and return false with bad input', () => {
        expect(isPreCompiledLineValid(null as any as string)).toBe(false);
      });
    });

    describe('isDirectiveLineValid', () => {
      for (const test in testCases) {
        if (isDirectiveLine(testCases[test])) {
          const isValid = !test.includes('invalid');
          it(`should return '${isValid}' for '${testCases[test]}'`, () => {
            expect(isDirectiveLineValid({ line: testCases[test], existingVariables: [] })).toBe(isValid);
          });
        }
      }
      it('should not throw and return false with bad input', () => {
        expect(isDirectiveLineValid({ line: null as any as string })).toBe(false);
      });
    });
  });

  describe('validateLineSyntax', () => {

  });
});
