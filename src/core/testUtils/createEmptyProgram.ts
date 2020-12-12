import { CompiledProgram } from '../types';

export const createEmptyCompiledProgram = () => Array(1024).fill([0,0,0,0]) as CompiledProgram;
