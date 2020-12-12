export const PROGNAME           = 'Beyond T-Robots';
export const VERSION            = '1.0';
export const CNOTICE1           = 'Copyright 2020, Andrew Docherty';
export const CNOTICE2           = 'All Rights Reserved.';
export const MAIN_FILENAME      = 'atr2';
export const ROBOT_EXT          = '.at2';
export const LOCKED_EXT         = '.atl';
export const CONFIG_EXT         = '.ats';
export const COMPILE_EXT        = '.cmp';
export const REPORT_EXT         = '.rep';
export const MIN_INT            = -32768;
export const MAX_INT            = 32767;

// debugging/compiler
export const SHOW_CODE          = false;
export const COMPILE_BY_LINE    = false;
export const MAX_VAR_LEN        = 16;
export const DEBUGGING_COMPILER = false;

// robots
export const MAX_ROBOTS         = 32;    // NOW ONLY USING ZERO INDEX ///{starts at 0, so total is MAX_ROBOTS+1}
export const MAX_PROGRAM_LENGTH = 1024;
export const MAX_OP             = 3;     // {etc...}
export const STACK_SIZE         = 256;   // NOW ONLY USING ZERO INDEX {but not here (it's a power of two, get the idea?)}
export const RAM_SIZE           = 1024;  // NOW ONLY USING ZERO INDEX {but this does start at 0 (odd #, 2^n-1)}
export const VARS_SIZE          = 256;
export const LABELS_SIZE        = 256;
export const ACCELERATION       = 4;
export const TURN_RATE          = 8;
export const MAX_VEL            = 4;
export const MISSILES_SIZE      = 1024;
export const MISSILE_SPD        = 32;
export const HIT_RANGE          = 14;
export const BLAST_RADIUS       = 25;
export const CRASH_RANGE        = 8;
export const MAX_SONAR          = 250;
export const COMM_QUEUE         = 512;
export const MAX_QUEUE          = 255;
export const MAX_CONFIG_POINTS  = 12;
export const MINES_SIZE         = 64;
export const MINE_BLAST         = 35;

// simulator & graphics
export const SCREEN_SCALE       = 0.46;
export const SCREEN_X           = 5;
export const SCREEN_Y           = 5;
export const ROBOT_SCALE        = 6;
export const DEFAULT_DELAY      = 20;
export const DEFAULT_SLICE      = 5;
export const MINE_CIRCLE        = Math.floor(Math.abs(MINE_BLAST * SCREEN_SCALE)) + 1;
export const BLAST_CIRCLE       = Math.floor(Math.abs(BLAST_RADIUS * SCREEN_SCALE)) + 1;
export const MIS_RADIUS         = Math.floor(Math.abs(HIT_RANGE / 2)) + 1;
export const MAX_ROBOT_LINES    = 8;
