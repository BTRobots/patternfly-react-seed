export enum OperationArguments {
  NUMBER,
  VARIABLE,
  REGISTER,
  MEMORY,
}

export type NumVar = OperationArguments.NUMBER | OperationArguments.VARIABLE;

export enum CommandEnum {
  NOP = 0,
  ADD = 1,
  SUB = 2,
  OR = 3,
  AND = 4,
  XOR = 5,
  NOT = 6,
  MPY = 7,
  DIV = 8,
  MOD = 9,
  RET = 10,
  RETURN = 10,
  GOSUB = 11,
  GSB = 11,
  CALL = 11,
  JMP = 12,
  JUMP = 12,
  GOTO = 12,
  JLS = 13,
  JB = 13,
  JGR = 14,
  JA = 14,
  JNE = 15,
  JE = 16,
  JEQ = 16,
  SWAP = 17,
  XCHG = 17,
  DO = 18,
  LOOP = 19,
  CMP = 20,
  TEST = 21,
  MOV = 22,
  SET = 22,
  LOC = 23,
  ADDR = 23,
  GET = 24,
  PUT = 25,
  INT = 26,
  IPO = 27,
  IN = 27,
  OPO = 28,
  OUT = 28,
  DELAY = 29,
  DEL = 29,
  PUSH = 30,
  POP = 31,
  ERR = 32,
  ERROR = 32,
  INC = 33,
  DEC = 34,
  SHL = 35,
  SHR = 36,
  ROL = 37,
  ROR = 38,
  JZ = 39,
  JNZ = 40,
  JAE = 41,
  JGE = 41,
  JLE = 42,
  JBE = 42,
  SAL = 43,
  SAR = 44,
  NEG = 45,
  JTL = 46,
}

const CommandMap = {
  NOP: '',
  ADD: '',
  SUB: '',
  OR: '',
  AND: '',
  XOR: '',
  NOT: '',
  MPY: '',
  DIV: '',
  MOD: '',
  RET: '',
  CALL: '',
  JMP: '',
  JLS: '',
  JGR: '',
  JNE: '',
  JE: '',
  SWAP: '',
  DO: '',
  LOOP: '',
  CMP: '',
  TEST: '',
  MOV: '',
  LOC: '',
  GET: '',
  PUT: '',
  INT: '',
  IPO: '',
  OPO: '',
  DELAY: '',
  PUSH: '',
  POP: '',
  ERR: '',
  INC: '',
  DEC: '',
  SHL: '',
  SHR: '',
  ROL: '',
  ROR: '',
  JZ: '',
  JNZ: '',
  JGA: '',
  JGE: '',
  JLE: '',
  SAL: '',
  SAR: '',
  NEG: '',
  JTL: '',
  XXX: '',
  // extendedoperations
  RETURN: '',
  GOSUB: '',
  JUMP: '',
  JB: '',
  GOTO: '',
  JA: '',
  JEQ: '',
  XCHG: '',
  SET: '',
  ADDR: '',
  IN: '',
  OUT: '',
  DEL: '',
  ERROR: '',
  JBE: '',
};

export type Command = keyof typeof CommandMap;

export enum RegisterEnum {
  COLCNT = 8,
  METERS = 9,
  COMBASE = 10,
  COMEND = 11,
  FLAGS = 64,
  AX = 65,
  BX = 66,
  CX = 67,
  DX = 68,
  EX = 69,
  FX = 70,
  SP = 71,
}

const RegisterMap = {
  COLCNT: '',
  METERS: '',
  COMBASE: '',
  COMEND: '',
  FLAGS: '',
  AX: '',
  BX: '',
  CX: '',
  DX: '',
  EX: '',
  FX: '',
  SP: '',
};
export type Register = keyof typeof RegisterMap;

export enum ConstantEnum {
  MAXINT = 32767,
  MININT = 32768,
  P_SPEDOMETER = 1,
  P_HEAT = 2,
  P_COMPASS = 3,
  P_TANGLE = 4,
  P_TURRET_OFS = 4,
  P_THEADING = 5,
  P_TURRET_ABS = 5,
  P_ARMOR = 6,
  P_DAMAGE = 6,
  P_SCAN = 7,
  P_ACCURACY = 8,
  P_RADAR = 9,
  P_RANDOM = 10,
  P_RAND = 10,
  P_THROTTLE = 11,
  P_TROTATE = 12,
  P_OFS_TURRET = 12,
  P_TAIM = 13,
  P_ABS_TURRET = 13,
  P_STEERING = 14,
  P_WEAP = 15,
  P_WEAPON = 15,
  P_FIRE = 15,
  P_SONAR = 16,
  P_ARC = 17,
  P_SCANARC = 17,
  P_OVERBURN = 18,
  P_TRANSPONDER = 19,
  P_SHUTDOWN = 20,
  P_CHANNEL = 21,
  P_MINELAYER = 22,
  P_MINETRIGGER = 23,
  P_SHIELD = 24,
  P_SHIELDS = 24,
  I_DESTRUCT = 0,
  I_RESET = 1,
  I_LOCATE = 2,
  I_KEEPSHIFT = 3,
  I_OVERBURN = 4,
  I_ID = 5,
  I_TIMER = 6,
  I_ANGLE = 7,
  I_TID = 8,
  I_TARGETID = 8,
  I_TINFO = 9,
  I_TARGETINFO = 9,
  I_GINFO = 10,
  I_GAMEINFO = 10,
  I_RINFO = 11,
  I_ROBOTINFO = 11,
  I_COLLISIONS = 12,
  I_RESETCOLCNT = 13,
  I_TRANSMIT = 14,
  I_RECEIVE = 15,
  I_DATAREADY = 16,
  I_CLEARCOM = 17,
  I_KILLS = 18,
  I_DEATHS = 18,
  I_CLEARMETERS = 19,
}

const ConstantMap = {
  MAXINT: '',
  MININT: '',
  P_SPEDOMETER: '',
  P_HEAT: '',
  P_COMPASS: '',
  P_TANGLE: '',
  P_TURRET_OFS: '',
  P_THEADING: '',
  P_TURRET_ABS: '',
  P_ARMOR: '',
  P_DAMAGE: '',
  P_SCAN: '',
  P_ACCURACY: '',
  P_RADAR: '',
  P_RANDOM: '',
  P_RAND: '',
  P_THROTTLE: '',
  P_TROTATE: '',
  P_OFS_TURRET: '',
  P_TAIM: '',
  P_ABS_TURRET: '',
  P_STEERING: '',
  P_WEAP: '',
  P_WEAPON: '',
  P_FIRE: '',
  P_SONAR: '',
  P_ARC: '',
  P_SCANARC: '',
  P_OVERBURN: '',
  P_TRANSPONDER: '',
  P_SHUTDOWN: '',
  P_CHANNEL: '',
  P_MINELAYER: '',
  P_MINETRIGGER: '',
  P_SHIELD: '',
  P_SHIELDS: '',
  I_DESTRUCT: '',
  I_RESET: '',
  I_LOCATE: '',
  I_KEEPSHIFT: '',
  I_OVERBURN: '',
  I_ID: '',
  I_TIMER: '',
  I_ANGLE: '',
  I_TID: '',
  I_TARGETID: '',
  I_TINFO: '',
  I_TARGETINFO: '',
  I_GINFO: '',
  I_GAMEINFO: '',
  I_RINFO: '',
  I_ROBOTINFO: '',
  I_COLLISIONS: '',
  I_RESETCOLCNT: '',
  I_TRANSMIT: '',
  I_RECEIVE: '',
  I_DATAREADY: '',
  I_CLEARCOM: '',
  I_KILLS: '',
  I_DEATHS: '',
  I_CLEARMETERS: '',
};

export type Constant = keyof typeof ConstantMap;

export type ProgramWord = number | string | null;
export type ProgramLine = [ProgramWord, ProgramWord, ProgramWord, ProgramWord];
export type Program = ProgramLine[];
export type PrecompiledWord = number | string;
export type PrecompiledLine = [
  number, // opcode
  PrecompiledWord, // number, variable, label reference
  PrecompiledWord,
  number, // microcode
  string | null, // label, removed for compiled lines
];
export type CompiledLine = [number, number, number, number];
export type CompiledProgram = CompiledLine[];

export interface Mine {
  x: Number; // was real, now float
  y: Number; // was real, now float
  detecy: number;
  yield: number;
  detonate: boolean;
}

export interface IRobot {
  is_locked: boolean;
  mem_watch: number;
  x: number;
  y: number;
  lx: number;
  ly: number;
  xv: number;
  yv: number;
  speed: number;
  shot_strength: number;
  damaged_adj: number;
  speed_adj: number;
  meters: number;

  hd: number;
  thd: number;
  lhd: number;
  spd: number;
  tspd: number;
  armor: number;
  larmor: number;
  heat: number;
  lheat: number;
  ip: number;

  plen: number;
  scan_arc: number;
  accuracy: number;
  shift: number;
  err: number;
  delay_left: number;
  robot_time_limit: number;
  max_time: number;
  time_left: number;
  l_shift: number;
  arc_count: number;
  sonar_count: number;
  scan_range: number;
  last_damage: number;
  last_hit: number;
  transponder: number;
  shutdown: number;
  channel: number;
  l_end_arc: number;
  end_arc: number;
  l_start_arc: number;
  start_arc: number;
  mines: number;

  tx: number[];
  ltx: number[];
  ty: number[];
  lty: number[];

  wins: number;
  trials: number;
  kills: number;
  deaths: number;
  startkills: number;
  shots_fired: number;
  match_shots: number;
  hits: number;
  damage_total: number;
  cycles_lived: number;
  error_count: number;
  config: Robot.Config;

  name: string;
  fn: string;

  shields_up: boolean;
  lshields: boolean;
  overburn: boolean;
  keepshift: boolean;
  cooling: boolean;
  won:boolean;

  code: CompiledProgram;
  stack: number[];
  ram: number[];
  mine: Mine[];
  errorlog: string;
}

export type Missile = {
  x: number;
  y: number;
  lx: number;
  ly: number;
  mult: number;
  mspd: number;
  source: number;
  a: number;
  hd: number;
  rad: number;
  lrad: number;
  max_rad: number;
};

export type Variable = number | null;
export type VariableMap = Map<string, Variable>;

export namespace Robot {
  export type CompilerHelper = {
    variableMap: VariableMap;
    config: Robot.Config;
  };

  export interface ConfigInput {
    name?: string;
    scanner?: number;
    weapon?: number;
    armor?: number;
    engine?: number;
    heatsinks?: number;
    shield?: number;
    mines?: number;
    program?: CompiledProgram;
    robot_time_limit?: number;
  }

  export class Config {
    readonly name: string;
    readonly scanner: number;
    readonly weapon: number;
    readonly armor: number;
    readonly engine: number;
    readonly heatsinks: number;
    readonly shield: number;
    readonly mines: number;
    readonly program: CompiledProgram;
    readonly robot_time_limit: number;
    constructor(input: ConfigInput) {
      this.name = input.name || '';
      this.scanner = input.scanner || 0;
      this.weapon = input.weapon || 0;
      this.armor = input.armor || 0;
      this.engine = input.engine || 0;
      this.heatsinks = input.heatsinks || 0;
      this.shield = input.shield || 0;
      this.mines = input.mines || 0;
      this.program = input.program || [];
      this.robot_time_limit = input.robot_time_limit || 0;
    }
  }
  // TODO - replace with more performant deep copy.
  export const clone = (inputRobot: IRobot): IRobot => JSON.parse(JSON.stringify(inputRobot));
}

export namespace Options {

  export type DebugCompiler = {
    show_code: boolean;
    compile_by_line: boolean;
    max_var_len: number;
    debugging_compiler: boolean;
  };

  export type Robots = {
    max_robots: number;
    max_code: number;
    max_op: number;
    max_stack: number; // power of 2
    max_ram: number; // 2^n-1
    max_vars: number;
    max_labels: number;
    acceleration: number;
    turn_rate: number;
    max_vel: number;
    max_missiles: number;
    missile_spd: number;
    hit_range: number;
    blast_radius: number;
    crash_range: number;
    max_sonar: number;
    com_queue: number;
    max_queue: number;
    max_config_points: number;
    max_mines: number;
    mine_blast: number;
  };

  export type SimulatorAndGraphics = {
    screen_scale: Number;
    screen_x: number;
    screen_y: number;
    robot_scale: number;
    default_delay: number;
    default_slice: number;
    mine_circle: number;
    blast_circle: number;
    mis_radius: number;
    max_robot_lines: number;
  };
}
export class LineType {}
export namespace LineType {
  export const EMPTY = 'EMPTY';
  export const BANG_LABEL = 'BANG_LABEL';
  export const COLON_LABEL = 'COLON_LABEL';
  export const COMMENT = 'COMMENT';
  export const PRE_COMPILED = 'PRE_COMPILED';
  export const OPERATION = 'OPERATION';
  export const DIRECTIVE = 'DIRECTIVE';
  export const UNKNOWN = 'UNKNOWN';
}

export enum DirectiveType {
  TIME_SLICE = 'TIME', // deprecated?
  VARIABLE_DECLARATION = 'DEF',
  MSG = 'MSG',
  CONFIGURATION = 'CONFIG',
  LOCK = 'LOCK',
  END = 'END',
}

export enum ConfigurationType {
  SCANNER = 'SCANNER',
  SHIELD = 'SHIELD',
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  ENGINE = 'ENGINE',
  HEATSINKS = 'HEATSINKS',
  MINES = 'MINES',
}

/*
export enum InstructionType {
  'EMPTY' = 'EMPTY',
  'BANG_LABEL' = 'BANG_LABEL',
  'COLON_LABEL' = 'COLON_LABEL',
  'COMMENT' = 'COMMENT',
  'PRE_COMPILED' = 'PRE_COMPILED',
  'OPERATION' = 'OPERATION',
  'DIRECTIVE' = 'DIRECTIVE',
  'UNKNOWN' = 'UNKNOWN',
}*/

export type Instruction = string | number;
export type InstructionTuple = [Instruction, Instruction, Instruction, Instruction];
export type MachineCodeTuple = [number, number, number, number];
export type DebuggingSymbol = {
  original_line_num: number;
  original_line_text: string;
  compiled_line_num: number | null;
  compiled_line_instructions?: InstructionTuple;
  line_type: LineType,
  instructions?: Instruction[];
};
export type DebuggingSymbols = DebuggingSymbol[];
