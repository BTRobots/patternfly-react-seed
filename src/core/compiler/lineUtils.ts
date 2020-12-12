import { LineType, DirectiveType, ConfigurationType } from '../types';
import { isCommand } from '../OperationCodeMap';
import { MAX_INT, MAX_VAR_LEN } from '../constants';
import { numberIsInBounds } from '../util/numberIsInBounds';
import { stringToInt } from '../util/stringToInt';

export const isEmptyLine = (line: string): boolean => {
  try {
    return line.trim().length === 0;
  } catch (err) {
    return false;
  }
};

export const isBangLabelLine = (line: string): boolean => {
  try {
    return line.trim().charAt(0) === '!';
  } catch (err) {
    return false;
  }
};

export const isColonLabelLine = (line: string): boolean => {
  try {
    return line.trim().charAt(0) === ':';
  } catch (err) {
    return false;
  }
};

export const isCommentLine = (line: string): boolean => {
  try {
    return line.trim().charAt(0) === ';';
  } catch (err) {
    return false;
  }
};

export const isDirectiveLine = (line: string): boolean => {
  try {
    return line.trim().charAt(0) === '#';
  } catch (err) {
    return false;
  }
};

export const isOperationLine = (line: string): boolean => {
  try {
    return isCommand(line.trim().split(' ')[0].toUpperCase());
  } catch (err) {
    return false;
  }
};

export const isPreCompiledLine = (line: string): boolean => {
  try {
    return line.trim().charAt(0) === '*';
  } catch (err) {
    return false;
  }
};

export const getLineType = (line: string): LineType => {
  try {
    if (isEmptyLine(line)) {
      return LineType.EMPTY;
    }
    if (isCommentLine(line)) {
      return LineType.COMMENT;
    }
    if (isDirectiveLine(line)) {
      return LineType.DIRECTIVE;
    }
    if (isPreCompiledLine(line)) {
      return LineType.PRE_COMPILED;
    }
    if (isBangLabelLine(line)) {
      return LineType.BANG_LABEL;
    }
    if (isColonLabelLine(line)) {
      return LineType.COLON_LABEL;
    }
    if (isOperationLine(line)) {
      return LineType.OPERATION;
    }
  } catch (err) {}
  return LineType.UNKNOWN;
};

export const parseColonLabelLine = (line: string): number => {
  const trimmed = line.trim();
  return stringToInt(trimmed.substr(1)); // remove leading colon
};



export const isBangLabelLineValid = (line: string): boolean => {
  try {
    const trimmed = line.trim();
    return isBangLabelLine(trimmed) &&
      /^(![\da-zA-Z]+)$/.test(trimmed);
  } catch (err) {
    return false;
  }
};

export const isColonLabelLineValid = (line: string): boolean => {
  try {
    const number = parseColonLabelLine(line);
    return isColonLabelLine(line) &&
      number >= 0 &&
      number <= MAX_INT;
  } catch (err) {
    return false;
  }
};

export interface IsDirectiveLineValidinput {
  line: string;
  existingVariables?: string[];
}
export const isDirectiveLineValid = ({ line, existingVariables }: IsDirectiveLineValidinput): boolean => {
  const vars = existingVariables || [];
  try {
    const trimmed = line.trim().toUpperCase();
    const [directive, param1, param2] = trimmed.substr(1)
      .replace(/,| {2,}/g, ' ') // remove commas
      .split(' ');
    switch (directive) {
      case DirectiveType.LOCK:
        // ignoring this for now
        return true;
        break;
      case DirectiveType.CONFIGURATION:
        if (!Object.keys(ConfigurationType).includes(param1)) {
          // bad config type
          return false;
        }
        try {
          stringToInt(param2);
        } catch (error) {
          return false;
        }
        return true;
        break;
      case DirectiveType.MSG:
        if (param1?.length < 32) {
          return true;
        }
        return false;
      case DirectiveType.TIME_SLICE:
        return stringToInt(param1) > 0;
      case DirectiveType.VARIABLE_DECLARATION:
        if (param1.length > MAX_VAR_LEN) {
          // variable name too long
          return false;
        }
        if (vars.includes(param1)) {
          // variable name already defined
          return false;
        }
        // explicitly not checking for number of variables
        return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};

export const isOperationLineValid = (line: string): boolean => {
  try {
    return isCommand(line.trim().split(' ')[0].toUpperCase());
  } catch (err) {
    return false;
  }
};

export const isPreCompiledLineValid = (line: string): boolean => {
  try {
    const trimmed = line.trim();
    // parse string as hex or int
    const numberArray = trimmed.substr(1)
      .replace(/,| {2,}/g, ' ')
      .split(' ')
      .map((numberString) => {
        const isHex = /^((0x[\d]+)|([\d]+h)+)$/.test(numberString);
        return parseInt(numberString, isHex ? 16 : 10);
      })
      .filter(numberIsInBounds);
    return isPreCompiledLine(trimmed) &&
      numberArray.length === 4;
  } catch (err) {
    return false;
  }
};

// throws if invalid
export const validateLineSyntax = (line: string, instructionType: LineType): void => {
  switch (instructionType) {
    case LineType.BANG_LABEL:
      break;
    case LineType.COLON_LABEL:
      break;
    case LineType.DIRECTIVE:
      break;
    case LineType.OPERATION:
      break;
    case LineType.PRE_COMPILED:
      break;
    case LineType.EMPTY:
    case LineType.COMMENT:
    case LineType.UNKNOWN:
    default:
      return;
  }
};

export const parseDirectiveLine = (line: string): void => {

}