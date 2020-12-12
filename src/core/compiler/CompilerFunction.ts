import { Robot, VariableMap, CompiledLine } from '../types';

export type LineCompilerInput = [Robot.Config, VariableMap, string];
export type LineCompilerOutput = [Robot.Config, VariableMap];
export type CompilerFunction = (...input: LineCompilerInput) => LineCompilerOutput;
