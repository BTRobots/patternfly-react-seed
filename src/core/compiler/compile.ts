import {
  Command,
  Robot,
  Program,
  VariableMap,
  CompiledProgram,
  CompiledLine,
  MachineCodeTuple,
  InstructionTuple,
  DebuggingSymbols,
  PrecompiledLine,
  PrecompiledWord,
  DebuggingSymbol,
  LineType,
  ConfigurationType,
  DirectiveType,
} from '../types';
import {
  MAX_PROGRAM_LENGTH,
  MAX_OP,
  VARS_SIZE,
  MAX_VAR_LEN,
  LABELS_SIZE,
  RAM_SIZE,
} from '../constants';
import {
  isCommand,
  isRegister,
  isConstant,
  getOpcodeMicrocodeTuple,
  isKnownInstruction,
} from '../OperationCodeMap';
import {
  getLineType,
  isBangLabelLine,
  isColonLabelLine,
  isCommentLine,
  isDirectiveLine,
  isEmptyLine,
  isOperationLine,
  isPreCompiledLine,
  validateLineSyntax,
} from './lineUtils';
import { replaceInvalidCharacters } from '../util/replaceInvalidCharacters';
import { stringToInt } from '../util/stringToInt';
import { checkProgramLength } from '../util/checkProgramLength';
import { filterExtraneousLines } from './filterExtraneousLines';

export type CompilerInput = {
  robot_file: string;
  emit_debug_symbols?: boolean;
  debug_logging?: boolean;
};

export type CompilerOutput = {
  robot_config: Robot.Config;
  debug_symbols?: DebuggingSymbols;
};

export const compile = (input: CompilerInput): CompilerOutput => {
  const {
    robot_file,
    emit_debug_symbols,
    debug_logging,
  } = input;

  const debug_symbols: DebuggingSymbols = [];

  const debugLog = (...args: any) => (debug_logging && console.log(`DEBUG ${args}`));

  // variables is a map of variable names and memory locations
  const variables: VariableMap = new Map();
  // Map<label name, program line number>

  const labels = new Map<string, number>();
  const reverseLabels = new Map<number, string>();
  const unresolvedLabels: string[] = [];

  const setLabel = (name: string, lineNum: number) => {
    labels.set(name, lineNum);
    if (lineNum !== -1) {
      // resolved
      reverseLabels.set(lineNum, name);
    } else {
      unresolvedLabels.push(name);
    }
  };

  const configInput: Robot.ConfigInput = {
  };
  const precomiledProgram: PrecompiledLine[] = [];

  const fileLines = robot_file
    // .toUpperCase()    // treat enitre file as uppercase
    .split(/\r?\n/g)
    .map(replaceInvalidCharacters)
    .map(line => line.trim());
    // .filter(filterExtraneousLines);

  if (fileLines.length === 0) {
    throw new Error('You must supply executable code!');
  }

  __lineLoop__:
  for (let lineNum = 0; lineNum < fileLines.length; lineNum++) {

    const line = fileLines[lineNum];
    checkProgramLength(precomiledProgram);
    debugLog(`line: ${lineNum}: ${line}`);

    const line_type = getLineType(line);

    const debug_symbol: DebuggingSymbol = {
      line_type,
      original_line_num: lineNum,
      original_line_text: line,
      compiled_line_num: null,
    };
    validateLineSyntax(line, line_type);
    switch (line_type){
      case LineType.EMPTY:
      case LineType.COMMENT:
        debug_symbols.push(debug_symbol);
        break;
      case LineType.DIRECTIVE:
        // Comiler Directives
        const directive = line.toUpperCase().substr(1).split(' ')[0];
        debugLog(`found directive: ${directive}`);
        if (directive === DirectiveType.VARIABLE_DECLARATION) {
          debugLog('found variable definition');
          const variableName = line.toUpperCase().replace(`#${directive}`, '').split(' ').filter(Boolean)[0].trim();
          // Variable Validation
          if (variableName.length > MAX_VAR_LEN) {
            throw new Error(`Variable name "${variableName}" is  ${variableName.length - MAX_VAR_LEN} characters too long!`);
          }
          if (variables.get(variableName) !== undefined) {
            throw new Error(`Cannot redeclare variable ${variableName}`);
          }
          if (variables.size >= VARS_SIZE) {
            throw new Error('Too many variables delcared!');
          }
          debugLog(`setting variable definition ${variableName}`);
          variables.set(variableName, variables.size + 128);

          break;
        }
        if (directive === DirectiveType.LOCK) {
          // skip
          break;
        }
        if (directive === DirectiveType.END) {
          debugLog('found the end - exiting!');
          break __lineLoop__;
        }
        if (directive === DirectiveType.MSG) {
          configInput.name = line.substr(line.indexOf(' ') + 1);
          debugLog(`set robot name (message) ${configInput.name}`);
          break;
        }
        if (directive === DirectiveType.TIME_SLICE) {
          const parsedTime = parseInt(line.substr(line.indexOf(' ') + 1), 10);
          configInput.robot_time_limit = !isNaN(parsedTime) && parsedTime > 0
            ? parsedTime
            : 0;
          debugLog(`set robot time limit ${configInput.robot_time_limit}`);
          break;
        }
        if (directive === DirectiveType.CONFIGURATION) {
          const [configKey, value] = line.toUpperCase().replace(`#${DirectiveType.CONFIGURATION}`, '').trim().split('=');
          const parsedValue = parseInt(value, 10);

          // values muse be between 0 and 5 inclusive
          const validatedValue = (isNaN(parsedValue) || parsedValue < 0)
            ? 0
            : parsedValue > 5
              ? 5
              : parsedValue;
          switch (configKey) {
            case 'SCANNER':
              configInput.scanner = validatedValue;
              debugLog(`set robot scanner to ${validatedValue}`);
              break;
            case 'SHIELD':
              configInput.shield = validatedValue;
              debugLog(`set robot shield to ${validatedValue}`);
              break;
            case 'WEAPON':
              configInput.weapon = validatedValue;
              debugLog(`set robot weapon to ${validatedValue}`);
              break;
            case 'ARMOR':
              configInput.armor = validatedValue;
              debugLog(`set robot armor to ${validatedValue}`);
              break;
            case 'ENGINE':
              configInput.engine = validatedValue;
              debugLog(`set robot engine to ${validatedValue}`);
              break;
            case 'HEATSINKS':
              configInput.heatsinks = validatedValue;
              debugLog(`set robot heatsinks to ${validatedValue}`);
              break;
            case 'MINES':
              configInput.mines = validatedValue;
              debugLog(`set robot mines to ${validatedValue}`);
              break;
            default:
              debugLog(`received bad config value ${configKey}`);
              throw new Error(`Unknown config setting ${configKey}`);
          }
        }
        break;
      case LineType.PRE_COMPILED: {
        const codeLine = line.substr(1).trim();
        // Inline Pre-Compiled Machine Code
        if (codeLine.includes('*')) {
          throw new Error('Too many asterisks!');
        }
        if (line.length <= 2) {
          throw new Error(`Insufficient data in data satement: ${line}`);
        }
        const codeChunks = codeLine.split(' ');
        const programLine = [0, 0, 0, 0].map((num, index) => {
          return codeChunks[index]
          ? stringToInt(codeChunks[index])
          : 0;
        }) as PrecompiledLine;
        debugLog(`found precompiled machine code ${codeLine}`);
        debugLog(`adding line to program ${programLine}`);
        precomiledProgram.push(programLine);
        break;
      } // end Inline Pre-Compiled Machine Code
      case LineType.BANG_LABEL: {
        // !labels
        const codeLine = line.substr(1);
        debugLog(`found !label ${codeLine}`);
        // labels.forEach((v,k) => debugLog(v, k));

        // find first occurance of special character (semi-colon, comma, or space)
        const firstSpecialCharacterIndex = codeLine.match(/[;, ]/)?.index;
        const labelName = firstSpecialCharacterIndex
          ? codeLine.slice(0, firstSpecialCharacterIndex)
          : codeLine;

        const labelValue = labels.get(labelName.toUpperCase());
        if (labelValue !== undefined && labelValue > -1) {
          // no redelcaring labels
          throw new Error(`Label '${labelName}' already defined!`);
        }
        if (labels.size === LABELS_SIZE) {
          // already at maximum number of labels
          throw new Error('Too many !labels');
        }
        debugLog(`setting !label ${labelName}`);
        setLabel(labelName.toUpperCase(), precomiledProgram.length);
        // precomiledProgram.push([0,0,0,0]); // labels are not included in compiled program
        break;
      }
      case LineType.COLON_LABEL: {
        // :labels
        const codeLine = line.substr(1);
        // :labels can only be 0-9
        if (!/\b\d+\b/.test(codeLine)) {
          throw new Error(`Invalid label '${codeLine}': only digits allowed`);
        }
        const compiledLine: PrecompiledLine = [stringToInt(codeLine), 0, 0, 2, null];
        debugLog(`found :label ${stringToInt(codeLine)}`);
        debugLog(`adding line to program ${compiledLine}`);
        precomiledProgram.push(compiledLine);
        break; // end :labels
      }
      default: {
        // instructions/numbers
        debugLog(`found instruction line ${line}`);

        // remove comments
        const codeLine = (line.includes(';')
          ? line.slice(0, line.indexOf(';'))
          : line).trim();

        // map instructions to tuple in a TypeScript-friendly way
        const instructions = codeLine.toUpperCase().replace(',', ' ')
          .split(' ')
          // .map(token => token.replace(/[ ,]/g, ''))
          .filter(Boolean);
        /*const instructions: [string, string, string, string] = [
          tokens[0] || '',
          tokens[1] || '',
          tokens[2] || '',
          tokens[3] || '',
        ];*/
        debugLog(`found instructions [${instructions.join()}]`);
        /*
          Microcode:
              0 = instruction, number, constant
              1 = variable, memory access
              2 = :label
              3 = !label (unresolved)
              4 = !label (resolved)
            8h mask = inderect addressing (enclosed in [])
        */

        // parse1 Instructions
        const machineCodeTuple: PrecompiledLine = [0, 0, 0, 0, null];
        instructions.forEach((instruction, index) => {
          let opcode: PrecompiledWord = 0;
          let microcode: number = 0;
          debugLog(`(instruction, index): ${instruction}, ${index}`);
          if (!instruction) {
            // machineCodeTuple[index] = opcode;
            // machineCodeTuple[MAX_OP] = machineCodeTuple[MAX_OP] | (microcode << (index * 4));
            return;
          }

          let indirect = false;
          let modifiedInstruction = '';
          if (instruction.startsWith('[') && instruction.endsWith(']')) {
            indirect = true;
            modifiedInstruction = instruction.replace(/\[|\]/g, '');
            debugLog('found indirect');
          } else {
            modifiedInstruction = instruction;
          }

          if (modifiedInstruction.startsWith('!')) {
            const label = modifiedInstruction.slice(1).toUpperCase(); // remove exclaimation point
            debugLog(`found !label reference for !${label}`);
            //labels.forEach((v,k) => debugLog(v, k));
            // look for existing !label
            const labelOpcode = labels.get(label);
            if (labelOpcode !== undefined) {
              opcode = labelOpcode;
              // label has previously been referenced 'in some way'
              // resolved: the line where the label is defined has already been parsed
              // unresolved: another line that references the label has been parsed, but not he lable itself
              if (labelOpcode >= 0) {
                // resolved !label
                microcode = 4;
                debugLog(`resolved label '${label}'`);
              } else {
                // labelOpcode = -1
                microcode = 3;
                opcode = labelOpcode;
                debugLog(`unresolved label reference '${label}'`);
              }
            } else {
              if (labels.size === LABELS_SIZE) {
                throw new Error(`Too many labels! (Label Limit: ${LABELS_SIZE}`);
              }

              // create new label
              // setLabel(label, -1); // we don't know which line
              debugLog(`created new, unresolved label '${label}'`);
              opcode = label;
              // unresolved !label, as it hasn't been used before
              microcode = 3;
            }

            // end !label
          } else if (variables.get(modifiedInstruction) !== undefined) {
            // already-defined variable, as a location in memory
            opcode = variables.get(modifiedInstruction) as number;
            debugLog(`found variable ${modifiedInstruction}`);
            microcode = 1;
          } else if (isKnownInstruction(modifiedInstruction)) {
            debugLog(`found known instruction ${modifiedInstruction}`);
            // instruction, constant, or register code
            const opcodeMicrocodeTuple = getOpcodeMicrocodeTuple(modifiedInstruction);
            debugLog(`opcodeMicrocodeTuple [${opcodeMicrocodeTuple.join(' ')}]`);
            opcode = opcodeMicrocodeTuple[0];
            if (opcodeMicrocodeTuple[1] !== null) {
              microcode = opcodeMicrocodeTuple[1];
            }
          } else if (/\B@[\d]/.test(modifiedInstruction)) {
            // memory address
            try {
              opcode = parseInt(modifiedInstruction.slice(1), 10);
            } catch (err) {
              throw new Error(`'Invalid memory address '${modifiedInstruction.slice(1)}'`);
            }
            if (opcode < 0 || opcode > (RAM_SIZE + 1 + (MAX_PROGRAM_LENGTH << 3) - 1)) {
              throw new Error(`Memory address '${opcode}' out of range`);
            }
            microcode = 1; // variable
          } else if (/^[\d-]/.test(modifiedInstruction)) {
            // number
            try {
              opcode = stringToInt(modifiedInstruction);
            } catch (err) {
              throw new Error(`'Invalid number '${modifiedInstruction}'`);
            }
          } else {
            throw new Error(`Undefined identifier '${modifiedInstruction}' - check your syntax for typos`);
          }
          machineCodeTuple[index] = opcode;
          debugLog(`setting tuple[${index}] opcode='${opcode}'`);
          if (indirect) {
            microcode |= 8;
            debugLog('indirect, microcode |= 8');
          }
          machineCodeTuple[MAX_OP] = machineCodeTuple[MAX_OP] | (microcode << (index * 4));
          debugLog(`setting tuple[MAX_OP] opcode='${machineCodeTuple[MAX_OP]}'`);
        });
        debugLog(`setting machineCodeTuple [${machineCodeTuple.join(' ')}]`);
        precomiledProgram.push(machineCodeTuple);
      }
    }
  }
  // currently breaks tests
  // if (program.length === 0) {
  //   throw new Error('You must supply more than just comment lines!');
  // }

  // debugLog('precomiled program before labels', precomiledProgram);
  if (debug_logging) {
    console.log(precomiledProgram.map(line => line.join(' ')).join('\n'));
  }

  // fill with empty lines
  // precomiledProgram.push([0,0,0,0,null]);

  // second pass, resolving !labels
  // replace all tuple indicies where microcode has mask
  //                looking for 3 after shr
  // 0000 0000 0000 0011
  const program: CompiledProgram = precomiledProgram.map((codeTuple) => {
    debugLog('Resolving unresolved labels');
    // all strings are unresolved references
    const outTup: CompiledLine = [0, 0, codeTuple[2] as number, codeTuple[3]];

    for (let i = 0; i < MAX_OP ; i++) {
      if (typeof codeTuple[i] === 'string') {
        // unresolved !label
        const lineNum = labels.get(codeTuple[i] as string);
        debugLog(`lineNum: ${lineNum}`);
        if (!lineNum) {
          throw new Error(`!label not found: ${codeTuple[i]}`);
        }
        outTup[i] = lineNum;
        const bitmask = ~(0xF << (i * 4));
        outTup[MAX_OP] = (codeTuple[MAX_OP] & bitmask) | (4 << (i * 4));
      } else {
        outTup[i] = codeTuple[i] as number;
      }
    }

    return outTup;
  });
  if (debug_logging) {
    program.forEach(line => console.log(line.join(' ')));
  }
  return {
    robot_config: new Robot.Config({
      ...configInput,
      program,
    }),
  };
};
/*
const parseInstructions = (lineTuple: string[]) => {
  let found = false;
  let opcode = 0;
  let microcode = 0;

  const tuple = lineTuple
    .map(l => l.toUpperCase())

}
*/