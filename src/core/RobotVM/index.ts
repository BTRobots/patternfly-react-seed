/*
  Controller

  Runs the machine code program, interacts with 'hardware' robot

*/

import { MAX_PROGRAM_LENGTH, MAX_OP, MAX_QUEUE, MINES_SIZE, RAM_SIZE, STACK_SIZE, COMM_QUEUE, MAX_INT } from '../constants';
import { Robot, CommandEnum, ConstantEnum } from '../types';
import { isMicrocodeValidForLine } from '../util/isMicrocodeValid';
import { findAngleInt } from '../findAngle';
import { lowerUpperBounds } from '../inBounds';
import { constants } from 'http2';

// even though the robot vm handles directions from 0-255, the sim uses radians
export interface TickOutput {
  desiredHeading: number; // RADIANS
  desiredSpeed: number;
  desiredTurrentRotation: number// Radians
  currentLife: number;
  currentHeat: number;
  layMine: boolean;
  fireMissile: boolean;
}

enum ErrorCodes {
  STACK_ARRAY_FULL = 'Stack array full - too many calls?',
  LABEL_NOT_FOUND = "Label not found.",
  CANNOT_ASSIGN_VALUE = 'Cannot assign value',
  ILLEGAL_MEMORY_REFERENCE = 'Illegal memory reference',
  STACK_ARRAY_EMPTY = 'Stack array empty - Too many Rets?',
  ILLEGAL_INSTRUCTION = 'Illegal instruction',
  RETURN_OUT_OF_RANGE = 'Return out of range',
  DIVIDE_BY_ZERO = 'Divide by zero',
  'UNRESOLVED_!LABEL' = 'Unresolved !label',
  INVALID_INTERRUPT_CALL = 'Invalid Interrupt Call',
  INVALID_PORT_ACCESS = 'Invalid port access',
  COMM_QUEUE_EMPTY = 'com queue empty',
  NO_MINES_ARRAY_LAYER = 'No mine array',
  NO_MINES_LEFT = 'No mines left',
  NO_SHEILD_INSTALLED = 'No shield installed',
  INVALID_MICROCODE = 'Invalid microcode instruction',
  UNKNOWN_ERROR = 'Unknown error',
}

enum Interrupt {
  SELF_DESTRUCT,
  RESET,
  LOCATE,
  KEEPSHIFT,
  OVERBURN,
  ID,
  TIMER,
  FIND_ANGLE,
  TARGET_ID,
  TARGET_INFO,
  GAME_INFO,
  ROBOT_INFO,
  COLLISIONS,
  RESET_COLLISION_COUNT,
  TRANSMIT,
  RECEIVE,
  DATA_READY,
  CLEAR_COMM_QUEUE,
  REPORT_KILLS_AND_DEATHS,
  CLEAR_METERS,
}

  /*
    Memory map:

    Addr:       Name:       Function:
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      0         Dspd        Desired speed robot is trying to achieve.
      1         Dhd         Desired heading robot is trying to achieve.
      2         tpos        Current turret offset
      3         acc         accuracy value from last scan
      4         swap        temporary swap space used by swap/xchg instruction
      5         tr-id       ID of last target scanned (by any scan).
      6         tr-dir      Relative heading of last target scanned.
      7         tr-spd      Throttle of last target scanned.
      8         ColCnt      Collision count.
      9         Meters      Meters travelled. 15 bits used.. (32767+1)=0
      10        ComBase     Current base of the communications queue
      11        ComEnd      Current end-point of the communications queue
      13        tr-vel      Absolute speed (cm/cycle) of last target scanned
    14-63       res         reserved
      64        flags       flags register
      65        ax          ax register
      66        bx          bx register
      67        cx          cx register
      68        dx          dx register
      69        ex          ex register
      70        fx          fx register
      71        sp          stack pointer
    72-95       res         reserved for future registers
    96-127      res         reserved
    128-384     var         variable space
    385-511     user        user space
    512-767     com-queue   Communications receiving queue
    768-1023    res         Reserved space
    1024...     code        Robot program (code segment) (ROM)

  */

// DOES NOT INCLUDE RANGES
enum Mem {
  DESIRED_SPEED = 0,
  DESIRED_HEADING = 1,
  CURRENT_TURRET_OFFSET = 2,
  ACCURACY_OF_LAST_SCAN = 3,
  SWAP_SPACE = 4,
  LAST_TARGET_SCANNED_ID = 5,
  LAST_TARGET_SCANNED_RELATIVE_HEADING = 6,
  LAST_TARGET_SCANNED_THROTTLE = 7,
  COLLISION_COUNT = 8,
  METERS_TRAVELED = 9,
  COMM_QUEUE_BASE = 10,
  COMM_QUEUE_END = 11,
  LAST_TARGET_SCANNED_VELOCITY = 13,
  FlAG_REGISTER = 64,
  AX_REGISTER = 65,
  BX_REGISTER = 66,
  CX_REGISTER = 67,
  DX_REGISTER = 68,
  EX_REGISTER = 69,
  FX_REGISTER = 70,
  STACK_POINTER = 71,
}

export const RobotVMFactory = ({
  armor: armorPoints,
  engine: enginePoints,
  heatsinks: heatsinkPoints,
  mines: minePoints,
  scanner: scannerPoints,
  shield: shieldPoints,
  weapon: weaponPoints,
  name,
  program,
  robot_time_limit,
}: Robot.Config): RobotVM => {
  /*
  ROBOT CONFIGURATIONS:

  Your robot has many devices at its command, such as a scanner, a weapon,
and an engine. You can adjust these devices, and change the emphasis in
your robot's design to custom-tweek it to suit your particular choice of
tactics. There are also some devices that can be added to your robot that
it would not otherwise have. These adjustments are made using the compiler
directive called "config".

For example:     #config scanner=1  ; This reduces scan range to 350 meters.

  By manipulating the number of points you have invested in each device,
you can change the overall configuration of your robot. Here are the tables
showing the effect and point-costs for each device:  (an asterisk (*) denotes
the default value for each device)

Points   Scanner  Weapon    Armor    Engine  Heatsinks  Mines  Shield
------   -------  ------  ---------  ------  ---------  -----  ------
   0       250     0.50   0.50,1.33   0.50     0.75       2*    None*
   1       350     0.80   0.66,1.20   0.80     1.00*      4       -
   2       500     1.00*  1.00,1.00*  1.00*    1.125      6       -
   3       700     1.20   1.20,0.85   1.20     1.25      10     Weak
   4      1000     1.35   1.30,0.75   1.35     1.33      16     Medium
   5      1500*    1.50   1.50,0.66   1.50     1.50      24     Strong
  

Scanner:   This is the maximum range your scanner can see.
Weapon:    A multiplier placed upon your missiles damage, speed, and heat.
Armor:     Two multipliers:   1. Armor multiplier   2. Speed multiplier
Engine:    This is the multiplier applied to your maximum speed.
Heatsinks: Change in heat dissipation (multiplier).
Mines:     This is the number of mines you start the battle with.
Shield:    It takes at least 3 points to get one. Blocks damage

  Shield damage blocking:

  Weak:    2/3 damage gets through, and 2/3 converted to heat. (1/3 overlap)
  Medium:  1/2 damage gets through, other half turned to heat.
  Strong:  1/3 damage gets through, and 1/3 converted to heat.


These multipliers are adjustments placed upon what the standard numbers
would be. For instance, Heatsinks=5 will dissipate heat 50% faster than
the default of Heatsinks=1.

You have a maximum of 12 points to allocate to all these systems and
devices. You can total less than 12, but not more.

Note- The speed multipliers from the engine and armor are both factored
into your maximum speed. However, the throttle is still percentage based,
so Throttle 100 is still maximum speed. Same goes for your armor; 100% is
still maximum armor. The armor difference is actually achieved by adjusting
the damage taken rather than the total number of armor points.
  */
  const scanner = [250, 350, 500, 750, 1000, 1500][lowerUpperBounds(scannerPoints, 0, 5)];
  const weapon = [.5, .8, 1, 1.2, 1.35, 1.5][lowerUpperBounds(weaponPoints, 0, 5)];
  const armor = [.5, .66, 1, 1.2, 1.3, 1.5][lowerUpperBounds(armorPoints, 0, 5)]
  const armorSpeedMultiplier = [1.33, 1.2, 1, .85, .75, .66][lowerUpperBounds(armorPoints, 0, 5)]
  const engine = [.5, .8, 1, 1.2, 1.35, 1.5][lowerUpperBounds(enginePoints, 0, 5)]
  const headsinks = [.75, 1, 1.125, 1.25, 1.33, 1.5][lowerUpperBounds(heatsinkPoints, 0, 5)];
  const mines = [2, 4, 6, 10, 16, 24][lowerUpperBounds(minePoints, 0, 5)];
  enum ShieldStrength {
    NONE,
    WEAK,
    MEDIUM,
    STRONG,
  }
  const shield = [
    ShieldStrength.NONE,
    ShieldStrength.NONE,
    ShieldStrength.NONE,
    ShieldStrength.WEAK,
    ShieldStrength.MEDIUM,
    ShieldStrength.STRONG,
  ][lowerUpperBounds(shieldPoints, 0, 5)]

  let desiredSpeed: number = 0;
  let desiredHeading: number = 0;
  let desiredTurrentRotation = 0;
  let shift: number = 0;
  let accuracy: number = 0;
  let incrementIP = true;

  const ramArray: number[] = new Array(RAM_SIZE).fill(0);
  ramArray[Mem.STACK_POINTER] = -1;

  const stackArray = new Array(STACK_SIZE).fill(0);
  const mineArray = new Array(MINES_SIZE);

  let currentX;
  let currentY;
  let currentSpeed = 0;
  let currentHeat = 0;
  let currentHeading = 0;
  let currentLife = 1000;
  let currenTurretRotation = 0;

  let gameCycle = 0;

  let scanArc = 0;
  let shutdown = 0;

  let err = 0;
  // execution helpers
  let lineNumber = 0;
  let linesExecuted = 0;
  let delayLeft = 0;
  let timeLeft = 0;
  let timeSlice = 5;
  let maxTime = 0;

  let overburn = false;
  let shieldsUp = false;
  let isCooling = false;
  let lshields = false;
  let keepshift = false;

  let transponder = 0;
  let speed = 0;
  let lastDamage = 0;
  let lastHit = 0;
  let channel = 0;
  let kills = 0;
  let startKills = 0;
  let deaths = 0;
  let metersTraveled = 0;


  const getFromRam = (ramIndex: number, unused: number): number => {
    if (ramIndex <= RAM_SIZE) {
      return ramArray[ramIndex];
    }

    // TODO: return garbage from other memory space;
    throw new Error('Out of bounds!');
  };

  const push = (value: number) => {
    if (ramArray[Mem.STACK_POINTER] >= 0 && ramArray[Mem.STACK_POINTER] < (STACK_SIZE - 1)) {
      stackArray[++ramArray[Mem.STACK_POINTER]] = value;
    } else {
      robotError(ErrorCodes.STACK_ARRAY_FULL);
    }
  };

  const pop = () => {
    if (ramArray[Mem.STACK_POINTER] >= 0 && ramArray[Mem.STACK_POINTER] < STACK_SIZE) {
      return stackArray[ramArray[Mem.STACK_POINTER]--];
    }
    robotError(ErrorCodes.STACK_ARRAY_EMPTY);
  };

  const findLabel = (label: number, microcode: number) => {
    let j;
    if (microcode === 3) {
      robotError(ErrorCodes.LABEL_NOT_FOUND, { label, microcode });
      throw new Error();
    }
    if (microcode === 4) {
      return label;
    }
    for (let i = 0; i <program.length; i++) {
      j = program[i][MAX_OP] & 15;
      if (j === 2 && program[i][0] === label) {
        return i;
      }
    }
    return -1;
  };

  const damage = (damage: number, physical: boolean) => {

  };

  // old 'do_robot'
  const tick = (): Partial<TickOutput> => {
    let fireMissile = false;
    let layMine = false;

    if (currentLife <= 0) {
      // you're already dead
      return {

      }
    }

    // time slice
    timeLeft = timeSlice;
    if (timeLeft > robot_time_limit && robot_time_limit > 0) {
      timeLeft = robot_time_limit;
    }
    if (timeLeft > maxTime && maxTime > 0) {
      timeLeft = maxTime;
    }
    linesExecuted = 0;

    // execute time slice
    while (timeLeft > 0 && !isCooling && linesExecuted < (20 + timeSlice) && currentLife > 0) {
      gameCycle++;
      if (delayLeft < 0) {
        delayLeft = 0;
      }

      if (delayLeft > 0) {
        delayLeft--;
        timeLeft--;
      }
      if (timeLeft > 0 && delayLeft === 0) {
        // step
        executeInstruction();
      }

      if (currentHeat >= shutdown) {
        isCooling = true;
        shieldsUp = false;
      }

      if (currentHeat >= 500) {
        // destroy
        damage(1000, true);
      }
    }


    // validate vairables
    desiredHeading = (desiredHeading + 1024) & 255;
    currentHeading = (currentHeading + 1024) & 255;
    shift = (shift + 1024) & 255;
    desiredSpeed = lowerUpperBounds(desiredSpeed, -75, 100);
    // current speed is set bounded, as the value comes from the sim
    lastDamage < MAX_INT && lastDamage++;
    lastHit < MAX_INT && lastHit++;

    // update heat
    if (shieldsUp && (gameCycle & 3) === 0) {
      currentHeat++;
    }
    if (!shieldsUp) {
      if (currentHeat > 0) {
        switch (heatsinkPoints) {
          case 5:
            (gameCycle & 1) === 0 && currentHeat--;
            break;
          case 4:
            (gameCycle & 3) === 0 && currentHeat--;
            break;
          case 3:
            (gameCycle & 3) === 0 && currentHeat--;
            break;
          case 2:
            (gameCycle & 7) === 0 && currentHeat--;
            break;
          case 1:
            // do nothing
            break;
          case 0:
            (gameCycle & 3) === 0 && currentHeat++;
            break;
        }
        if (overburn && gameCycle % 3 === 0) {
          currentHeat++;
        }
        
        currentHeat > 0 && currentHeat--;

        if (currentHeat > 0 && (gameCycle & 7) === 0 && Math.abs(desiredSpeed) <= 25) {
          currentHeat--;
        }

        if (currentHeat <= shutdown - 50 || currentHeat <= 0) {
          isCooling = false;
        }
      }
    }

    if (isCooling) {
      desiredSpeed = 0;
    }

    let heatMultiplier = 1;
    if (currentHeat >= 250){
      heatMultiplier = .5;
    } else if (currentHeat >= 200) {
      heatMultiplier = .75;
    } else if (currentHeat >= 150) {
      heatMultiplier = .85;
    } else if (currentHeat >= 100) {
      heatMultiplier = .95;
    } else if (currentHeat >= 80) {
      heatMultiplier = .98;
    }

    if (overburn) {
      heatMultiplier *= 1.3;
    }

    if (
      (currentHeat >= 475 && (gameCycle & 3) === 0) ||
      (currentHeat >= 450 && (gameCycle & 7) === 0) ||
      (currentHeat >= 400 && (gameCycle & 15) === 0) ||
      (currentHeat >= 350 && (gameCycle & 31) === 0) ||
      (currentHeat >= 300 && (gameCycle & 63) === 0) 
      ){
        // apply heat damage
      damage(1, true);
    }

    // robot movement
    return {
      currentHeat,
      currentLife,
      desiredHeading,
      desiredSpeed,
      desiredTurrentRotation,
      fireMissile,
      layMine,
    }
  };

  // ask sim for target scan
  const scan = (): number => {
    return 0;
  };

  // ask sim for radar scan
  const radar = (): number => {
    return 0;
  };

  // ask sim for sonar scan
  interface SonarOutput {
    value: number;
    lastTargetScannedID?: number;
  }
  const sonar = (): SonarOutput => {
    return {
      value: 0,
    };
  };

  // ask sim to trigger mines
  const triggerMines = (): number => {
    if (mines === 0) {
      return 0;
    }
    return 1;
  };

  const comTransmit = (txChannel: number, data: number) => {
    if (armor > 0 && txChannel === channel) {
      if (ramArray[Mem.COMM_QUEUE_BASE] < 0 || ramArray[Mem.COMM_QUEUE_BASE] > MAX_QUEUE) {
        ramArray[Mem.COMM_QUEUE_BASE] = 0;
      }
      if (ramArray[Mem.COMM_QUEUE_END] < 0 || ramArray[Mem.COMM_QUEUE_END] > MAX_QUEUE) {
        ramArray[Mem.COMM_QUEUE_END] = 0;
      }
      ramArray[ramArray[Mem.COMM_QUEUE_END] + COMM_QUEUE] = data;
    }
  };
  const comReceive = (): number => {
    if (ramArray[Mem.COMM_QUEUE_BASE] !== ramArray[Mem.COMM_QUEUE_END]) {
      if (ramArray[Mem.COMM_QUEUE_BASE] < 0 || ramArray[Mem.COMM_QUEUE_BASE] > MAX_QUEUE) {
        ramArray[Mem.COMM_QUEUE_BASE] = 0;
      }
      if (ramArray[Mem.COMM_QUEUE_END] < 0 || ramArray[Mem.COMM_QUEUE_END] > MAX_QUEUE) {
        ramArray[Mem.COMM_QUEUE_END] = 0;
      }
      const tmp = ramArray[ramArray[Mem.COMM_QUEUE_BASE] + COMM_QUEUE];
      ramArray[Mem.COMM_QUEUE_BASE]++;
      if (ramArray[Mem.COMM_QUEUE_BASE] > MAX_QUEUE) {
        ramArray[Mem.COMM_QUEUE_BASE] = 0;
      }
      return tmp;
    }
    robotError(ErrorCodes.COMM_QUEUE_EMPTY);
    return 0;
  };

  interface InPortOutput {
    value: number;
    timeUsed?: number;
  }
  const inPort = (port: number): InPortOutput => {
    let retVal = 0;
    let retTimeUsed = 0;
    switch (port) {
      case (ConstantEnum.P_SPEDOMETER):
        retVal = currentSpeed;
        break;
      case (ConstantEnum.P_HEAT):
        retVal = currentHeat;
        break;
      case (ConstantEnum.P_COMPASS):
        retVal = currentHeading;
        break;
      case (ConstantEnum.P_TURRET_OFS):
        retVal = shift;
        break;
      case (ConstantEnum.P_TURRET_ABS):
        retVal = (shift + currentHeading) & 255;
        break;
      case (ConstantEnum.P_DAMAGE):
        retVal = currentLife;
        break;
      case (ConstantEnum.P_SCAN):
        retVal = scan();
        retTimeUsed++;
        break;
      case (ConstantEnum.P_ACCURACY):
        retVal = accuracy;
        retTimeUsed++;
        break;
      case (ConstantEnum.P_RADAR): {
        retVal = radar();
        retTimeUsed += 3;
        break;
      }
      case (ConstantEnum.P_RANDOM):
        retVal = Math.floor(Math.random() * MAX_INT);
        break;
      case (ConstantEnum.P_SONAR): {
        const {
          value,
          lastTargetScannedID,
        } = sonar();

        retVal = value;
        if (lastTargetScannedID) {
          ramArray[Mem.LAST_TARGET_SCANNED_ID] = lastTargetScannedID;
        }
        retTimeUsed = 40;
        break;
      }
      case (ConstantEnum.P_SCANARC):
        retVal = scanArc;
        break;
      case (ConstantEnum.P_OVERBURN):
        retVal = overburn ? 1 : 0;
        break;
      case (ConstantEnum.P_TRANSPONDER):
        retVal = transponder;
        break;
      case (ConstantEnum.P_SHUTDOWN):
        retVal = shutdown;
        break;
      case (ConstantEnum.P_CHANNEL):
        retVal = channel;
        break;
      case (ConstantEnum.P_MINELAYER):
        retVal = mines;
        break;
      case (ConstantEnum.P_MINETRIGGER):
        // return number of mines?
        retVal = mineArray.length;
        break;
      case (ConstantEnum.P_SHIELDS):
        if (shield) {
          retVal = shieldsUp ? 1 : 0;
        } else {
          retVal = 0;
          shieldsUp = false;
        }
        break;
      default:
        robotError(ErrorCodes.INVALID_PORT_ACCESS);
    }
    return {
      value: retVal,
      timeUsed: retTimeUsed,
    };
  };

  const outPort = (port: number, value: number): number => {
    let retTimeUsed = 0;
    switch (port) {
      case (ConstantEnum.P_THROTTLE):
        desiredSpeed = value;
        break;
      case (ConstantEnum.P_OFS_TURRET):
        shift = (shift + value + 1024) & 255;
        break;
      case (ConstantEnum.P_ABS_TURRET):
        shift = (value + 1024) & 255;
        break;
      case (ConstantEnum.P_STEERING):
        desiredHeading = (desiredHeading + value + 1024) & 255;
        break;
      case (ConstantEnum.P_WEAPON):
        retTimeUsed = 3;
        fireMissile(value);
        break;
      case (ConstantEnum.P_SCAN):
        scanArc = value;
        break;
      case (ConstantEnum.P_CHANNEL):
        channel = value;
        break;
      case (ConstantEnum.P_MINELAYER):
        layMine();
        break;
      case (ConstantEnum.P_MINETRIGGER):
        detonateMines();
        break;
      case (ConstantEnum.P_SHIELDS):
        shieldsUp = shield > 3 && !!value;
        break;
      default:
        robotError(ErrorCodes.INVALID_PORT_ACCESS);
    }
    // ? this is odd
    scanArc = lowerUpperBounds(scanArc, 0, 64);
    return retTimeUsed;
  };

  const init = () => {

  };

  const resetSoftware = () => {
    ramArray.fill(0);
    stackArray.fill(0);
    desiredHeading = currentHeading;
    desiredSpeed = 0;
    scanArc = 8;
    shift = 0;
    err = 0;
    overburn = false;
    keepshift = false;
    lineNumber = 0;
    accuracy = 0;
    metersTraveled = 0;
    delayLeft = 0;
    timeLeft = 0;
    shieldsUp = false;
  };

  const resetHardware = () => {

  };

  const setX = (x: number) => {
    // get x coord from world
    currentX = x;
  };
  const setY = (y: number) => {
    // get x coord from world
    currentY = y;
  };

  const setSpeed = (speed: number) => {
    // get speed from sim
    currentSpeed = lowerUpperBounds(speed, -75, 100);
  };

  // get current time from sim
  const setCycle = (cycle) => {
    ;
  };

  // create a missile in the sim
  const fireMissile = (value: number) => {
    const val = lowerUpperBounds(value, -4, 4);
  };

  const layMine = () => {

  };

  const detonateMines = () => {

  };

  const callInterrupt = (interruptNum: number): number => {
    let retTimeUsed = 0;
    switch (interruptNum){
      case Interrupt.SELF_DESTRUCT:
        damage(1000, true);
        break;
      case Interrupt.RESET:
        resetSoftware();
        retTimeUsed = 10;
        break;
      case Interrupt.LOCATE:
        ramArray[Mem.EX_REGISTER] = Math.floor(currentX);
        ramArray[Mem.FX_REGISTER] = Math.floor(currentY);
        retTimeUsed = 5;
        break;
      case Interrupt.KEEPSHIFT:
        keepshift = ramArray[Mem.AX_REGISTER] !== 0;
        ramArray[Mem.FX_REGISTER] = shift & 0xFF;
        retTimeUsed = 2;
        break;
      case Interrupt.OVERBURN:
        overburn = ramArray[Mem.AX_REGISTER] !== 0;
        break;
      case Interrupt.ID:
        ramArray[Mem.FX_REGISTER] = transponder;
        retTimeUsed = 2;
        break;
      case Interrupt.TIMER:
        const currentTic = gameCycle;
        ramArray[Mem.EX_REGISTER] = currentTic >> 16;
        ramArray[Mem.FX_REGISTER] = currentTic & 65535;
        retTimeUsed = 2;
        break;
      case Interrupt.FIND_ANGLE: {
        // between 0 and 1000
        const tmp1 = Math.max(0, Math.min(ramArray[Mem.EX_REGISTER], 1000));
        const tmp2 = Math.max(0, Math.min(ramArray[Mem.FX_REGISTER], 1000));
        ramArray[Mem.AX_REGISTER] = findAngleInt(Math.round(currentX), Math.round(currentY), tmp1, tmp2);
        retTimeUsed = 32;
        break;
      }
      case Interrupt.TARGET_ID:
        ramArray[Mem.FX_REGISTER] = ramArray[Mem.LAST_TARGET_SCANNED_ID];
        retTimeUsed = 1;
        break;
      case Interrupt.TARGET_INFO:
        ramArray[Mem.EX_REGISTER] = ramArray[Mem.LAST_TARGET_SCANNED_RELATIVE_HEADING];
        ramArray[Mem.FX_REGISTER] = ramArray[Mem.LAST_TARGET_SCANNED_THROTTLE];
        retTimeUsed = 2;
        break;
      case Interrupt.GAME_INFO:
        ramArray[Mem.DX_REGISTER] = 1; // TODO: total number of robots
        ramArray[Mem.EX_REGISTER] = 1; // TODO: total number of games played
        ramArray[Mem.FX_REGISTER] = 1; // TODO: total number of matches
        retTimeUsed = 4;
        break;
      case Interrupt.ROBOT_INFO:
        ramArray[Mem.DX_REGISTER] = Math.round(setSpeed() * 100);
        ramArray[Mem.EX_REGISTER] = lastDamage;
        ramArray[Mem.FX_REGISTER] = lastHit;
        retTimeUsed = 5;
        break;
      case Interrupt.COLLISIONS:
        ramArray[Mem.FX_REGISTER] = ramArray[Mem.COLLISION_COUNT];
        retTimeUsed = 1;
        break;
      case Interrupt.RESET_COLLISION_COUNT:
        ramArray[Mem.COLLISION_COUNT] = 0;
        retTimeUsed = 1;
        break;
      case Interrupt.TRANSMIT:
        comTransmit(channel, ramArray[Mem.AX_REGISTER]);
        retTimeUsed = 1;
        break;
      case Interrupt.RECEIVE:
        if (ramArray[Mem.COMM_QUEUE_BASE] !== ramArray[Mem.COMM_QUEUE_END]) {
          ramArray[Mem.FX_REGISTER] = comReceive();
        } else {
          ramArray[Mem.FX_REGISTER] = MAX_QUEUE
            + 1
            - ramArray[Mem.COMM_QUEUE_BASE]
            + ramArray[Mem.COMM_QUEUE_END];
        }
        retTimeUsed = 1;
        break;
      case Interrupt.CLEAR_COMM_QUEUE:
        ramArray[Mem.COMM_QUEUE_BASE] = 0;
        ramArray[Mem.COMM_QUEUE_END] = 0;
        retTimeUsed = 1;
        break;
      case Interrupt.REPORT_KILLS_AND_DEATHS:
        ramArray[Mem.DX_REGISTER] = kills;
        ramArray[Mem.EX_REGISTER] = kills - startKills;
        ramArray[Mem.FX_REGISTER] = deaths;
        retTimeUsed = 3;
        break;
      case Interrupt.CLEAR_METERS:
        ramArray[Mem.METERS_TRAVELED] = 0;
        metersTraveled = 0;
        break;
      default:
        robotError(ErrorCodes.INVALID_INTERRUPT_CALL);
    }
    return retTimeUsed;
  };

  const jump = (operationIndex: number, inc: boolean) => {
    const location = findLabel(getValue(lineNumber, operationIndex), program[lineNumber][MAX_OP] >> (operationIndex *  4));
    if (location >= 0 && location <= program.length) {
      lineNumber = location;
      incrementIP = false;
    } else {
      robotError(ErrorCodes.LABEL_NOT_FOUND);
    }
  };

  const robotError = (error: ErrorCodes, ...args) => {
    console.error(error, `cycle: ${gameCycle}`, ...args);
  };

  const getValue = (lineNum: number, operationIndex: number): number => {
    let outVal: number = 0;
    const microcodeBitmask = (program[lineNum][MAX_OP] >> (4 * operationIndex)) & 15;
    const operation = program[lineNum][operationIndex];

    if ((microcodeBitmask & 7) === 1) {
      return getFromRam(operation, microcodeBitmask);
    }
    outVal = 1;
    if ((microcodeBitmask & 8) > 0) {
      return getFromRam(outVal, microcodeBitmask);
    }
    return outVal;
  };

  const putValue = (lineNum: number, operationNum: number, value: number) => {
    const microcodeBitmask = (program[lineNum][MAX_OP] >> (operationNum * 4)) & 15;
    let i = program[lineNum][operationNum];
    if ((microcodeBitmask & 7) === 1) {
      if (i < 0 || i > RAM_SIZE) {
        robotError(ErrorCodes.STACK_ARRAY_EMPTY);
      } else {
        if ((microcodeBitmask & 8) > 0) {
          i = ramArray[i];
          if (i < 0 || i > RAM_SIZE) {
            robotError(ErrorCodes.STACK_ARRAY_EMPTY);
          } else {
            ramArray[i] = value;
          }
        } else {
          ramArray[i] = value;
        }
      }
    } else {
      robotError(ErrorCodes.ILLEGAL_MEMORY_REFERENCE);
    }
  };

  const executeInstruction = () => {

    ramArray[0] = desiredSpeed;
    ramArray[1] = desiredHeading;
    ramArray[2] = shift;
    ramArray[3] = accuracy;

    let timeUsed = 1;

    if (lineNumber > program.length || lineNumber < 0) {
      lineNumber = 0;
    }

    if (!isMicrocodeValidForLine(program[lineNumber])) {
      timeUsed = 1;
      robotError(ErrorCodes.INVALID_MICROCODE);
    }

    if (![0,1].includes(program[lineNumber][MAX_OP] & 7)) {
      timeUsed = 0;
    } else {
      switch (getValue(lineNumber, 0)) {
        case (CommandEnum.NOP):

          break;
        case (CommandEnum.ADD):
          putValue(lineNumber, 1, getValue(lineNumber, 1) + getValue(lineNumber, 2));
          break;
        case (CommandEnum.SUB):
          putValue(lineNumber, 1, getValue(lineNumber, 1) - getValue(lineNumber, 2));
          break;
        case (CommandEnum.OR):
          putValue(lineNumber, 1, getValue(lineNumber, 1) | getValue(lineNumber, 2));
          break;
        case (CommandEnum.AND):
          putValue(lineNumber, 1, getValue(lineNumber, 1) & getValue(lineNumber, 2));
          break;
        case (CommandEnum.XOR):
          putValue(lineNumber, 1, getValue(lineNumber, 1) ^ getValue(lineNumber, 2));
          break;
        case (CommandEnum.NOT):
          putValue(lineNumber, 1, ~ getValue(lineNumber, 1));
          break;
        case (CommandEnum.MPY):
          putValue(lineNumber, 1, getValue(lineNumber, 1) * getValue(lineNumber, 2));
          timeUsed = 10;
          break;
        case (CommandEnum.DIV): {
          const tmp = getValue(lineNumber, 2);
          if (tmp !== 0) {
            putValue(lineNumber, 1, getValue(lineNumber, 1) / getValue(lineNumber, 2));
          } else {
            robotError(ErrorCodes.DIVIDE_BY_ZERO);
          }
          timeUsed = 10;
          break;
        }
        case (CommandEnum.MOD): {
          const tmp = getValue(lineNumber, 2);
          if (tmp !== 0) {
            putValue(lineNumber, 1, getValue(lineNumber, 1) % getValue(lineNumber, 2));
          } else {
            robotError(ErrorCodes.DIVIDE_BY_ZERO);
          }
          timeUsed = 10;
          break;
        }
        case (CommandEnum.RET):
          lineNumber = pop();
          if (lineNumber < 0 || lineNumber > program.length) {
            robotError(ErrorCodes.RETURN_OUT_OF_RANGE);
          }
          break;
        case (CommandEnum.GSB): {
          const location = findLabel(getValue(lineNumber, 1), program[lineNumber][MAX_OP] >> 4);
          if (location >= 0) {
            push(lineNumber);
            incrementIP = false;
            lineNumber = location;
          } else {
            robotError(ErrorCodes.CANNOT_ASSIGN_VALUE);
          }
          break;
        }
        case (CommandEnum.JMP):
          jump(1, incrementIP);
          break;
        case (CommandEnum.JLS):
        case (CommandEnum.JB):
          if ((ramArray[Mem.FlAG_REGISTER] & 2) > 0) {
            jump(1, incrementIP);
          }
          timeUsed = 0;
          break;
        case (CommandEnum.JGR):
        case (CommandEnum.JA):
          if ((ramArray[Mem.FlAG_REGISTER] & 4) > 0) {
            jump(1, incrementIP);
          }
          timeUsed = 0;
          break;
        case (CommandEnum.JNE):
          if ((ramArray[Mem.FlAG_REGISTER] & 1) === 0) {
            jump(1, incrementIP);
          }
          timeUsed = 0;
          break;
        case (CommandEnum.JEQ):
        case (CommandEnum.JE):
          if ((ramArray[Mem.FlAG_REGISTER] & 1) > 0) {
            jump(1, incrementIP);
          }
          timeUsed = 0;
          break;
        case (CommandEnum.SWAP):
        case (CommandEnum.XCHG):
          ramArray[Mem.SWAP_SPACE] = getValue(lineNumber, 1);
          putValue(lineNumber, 1, getValue(lineNumber, 2));
          putValue(lineNumber, 2, ramArray[Mem.SWAP_SPACE]);
          timeUsed = 3;
          break;
        case (CommandEnum.DO):
          ramArray[Mem.CX_REGISTER] = getValue(lineNumber, 1);
          break;
        case (CommandEnum.LOOP):
          if (--ramArray[Mem.CX_REGISTER] > 0) {
            jump(1, incrementIP);
          }
          break;
        case (CommandEnum.CMP): {
          const tmp = getValue(lineNumber, 1) - getValue(lineNumber, 2);
          ramArray[Mem.FlAG_REGISTER] &= 0xFFF0;
          if (tmp === 0) {
            ramArray[Mem.FlAG_REGISTER] |= 1;
          }
          if (tmp < 0) {
            ramArray[Mem.FlAG_REGISTER] |= 2;
          }
          if (tmp > 0) {
            ramArray[Mem.FlAG_REGISTER] |= 4;
          }
          if (getValue(lineNumber, 2) === 0 && tmp === 0) {
            ramArray[Mem.FlAG_REGISTER] |= 8;
          }
          break;
        }
        case (CommandEnum.TEST): {
          const tmp = getValue(lineNumber, 1) & getValue(lineNumber, 2);
          ramArray[Mem.FlAG_REGISTER] &= 0xFFF0;

          if (tmp === getValue(lineNumber, 2)) {
            ramArray[Mem.FlAG_REGISTER] |= 1;
          }
          if (tmp === 0) {
            ramArray[Mem.FlAG_REGISTER] |= 8;
          }
          break;
        }
        case (CommandEnum.MOV):
        case (CommandEnum.SET):
          putValue(lineNumber, 1, getValue(lineNumber, 2));
          break;
        case (CommandEnum.LOC):
          putValue(lineNumber, 1, program[lineNumber][2]);
          timeUsed = 2;
          break;
        case (CommandEnum.GET): {
          const tmp = getValue(lineNumber, 2);
          if (tmp >= 0 && tmp < RAM_SIZE) {
            putValue(lineNumber, 1, ramArray[tmp]);
          } else if (tmp >= RAM_SIZE && tmp <= RAM_SIZE + ((MAX_PROGRAM_LENGTH) << 3) - 1) {
            const tmp2 = tmp - RAM_SIZE;
            putValue(lineNumber, 1, program[tmp2 >> 2][tmp2 & 3]);
          } else {
            robotError(ErrorCodes.STACK_ARRAY_EMPTY);
          }
          timeUsed = 2;
          break;
        }
        case (CommandEnum.PUT): {
          const tmp = getValue(lineNumber, 2);
          if (tmp >= 0 && tmp < RAM_SIZE) {
            ramArray[tmp] = getValue(lineNumber, 1);
          } else {
            robotError(ErrorCodes.STACK_ARRAY_EMPTY);
          }
          timeUsed = 2;
          break;
        }
        case (CommandEnum.INT):
          timeUsed = callInterrupt(getValue(lineNumber, 1));
          break;
        case (CommandEnum.IPO):
        case (CommandEnum.IN):
          const {
            value,
            timeUsed: retTimeUsed,
          } = inPort(getValue(lineNumber, 1));
          putValue(lineNumber, 2, value);
          timeUsed = (retTimeUsed || 0) + 4;
          break;
        case (CommandEnum.OPO):
        case (CommandEnum.OUT):
          timeUsed = 4 + outPort(getValue(lineNumber, 1), getValue(lineNumber, 2));
          break;
        case (CommandEnum.DEL):
        case (CommandEnum.DELAY):
          timeUsed = getValue(lineNumber, 1);
          break;
        case (CommandEnum.PUSH):
          push(getValue(lineNumber, 1));
          break;
        case (CommandEnum.POP):
          putValue(lineNumber, 1, pop());
          break;
        case (CommandEnum.ERR):
          // robotError(getValue(lineNumber, 1));
          break;
        case (CommandEnum.INC):
          putValue(lineNumber, 1, getValue(lineNumber, 1) + 1);
          break;
        case (CommandEnum.DEC):
          putValue(lineNumber, 1, getValue(lineNumber, 1) - 1);
          break;
        case (CommandEnum.SAL):
        case (CommandEnum.SHL):
          putValue(lineNumber, 1, getValue(lineNumber, 1) << getValue(lineNumber, 2));
          break;
        case (CommandEnum.SHR):
          putValue(lineNumber, 1, getValue(lineNumber, 1) >> getValue(lineNumber, 2));
          break;
        case (CommandEnum.ROL):
          // bit rotate left
          break;
        case (CommandEnum.ROR):
          // bit rotate right
          break;
        case (CommandEnum.JZ):
          if ((ramArray[Mem.FlAG_REGISTER] & 8) > 0) {
            jump(1, incrementIP);
          }
          break;
        case (CommandEnum.JNZ):
          if ((ramArray[Mem.FlAG_REGISTER] & 8) === 0) {
            jump(1, incrementIP);
          }
          break;
        case (CommandEnum.JAE):
        case (CommandEnum.JGE):
          if ((ramArray[Mem.FlAG_REGISTER] & 1) > 0 || (ramArray[Mem.FlAG_REGISTER] & 4) > 0) {
            jump(1, incrementIP);
          }
          break;
        case (CommandEnum.JBE):
        case (CommandEnum.JLE):
          if ((ramArray[Mem.FlAG_REGISTER] & 1) > 0 || (ramArray[Mem.FlAG_REGISTER] & 2) > 0) {
            jump(1, incrementIP);
          }
          break;
        case (CommandEnum.SAR):
          // shift right preserving sign
          putValue(lineNumber, 1, getValue(lineNumber, 1) >>> getValue(lineNumber, 2));
          break;
        case (CommandEnum.NEG):
          putValue(lineNumber, 1, 0 - getValue(lineNumber, 1));
          break;
        case (CommandEnum.JTL): {
          const location = getValue(lineNumber, 1);
          if (location >= 0 && location < program.length) {
            incrementIP = false;
            lineNumber = location;
          } else {
            robotError(ErrorCodes.CANNOT_ASSIGN_VALUE);
          }
          break;
        }
        default:
          robotError(ErrorCodes.ILLEGAL_INSTRUCTION);
      }
    }
    delayLeft += timeUsed;
    if (incrementIP) {
      lineNumber++;
    }
    linesExecuted++;
  };

  const setWorldInfo = ({
    x,
    y,
    speed,
    heading,
  }: SetWorldInfoInput) => {
    currentX = x;
    currentY = y;
    currentSpeed = speed;
  }


  return {
    tick,
    setWorldInfo,
    // comReceive,
  }
}


export enum RobotVMCommand {
  SET_SPEED,
  SET_HEADING,
  SET_TURRET_HEADING,
  SET_TURRENT_ABSOLUTE_HEADING,
  FIRE,
  LAY_MINE,
  RADAR,
  SONOR,
}

export interface SetWorldInfoInput {
  x: number,
  y: number,
  speed: number,
  heading: number, // radians
}

export interface RobotVM {
  tick: () => void;
  setWorldInfo: (input: SetWorldInfoInput) => void
  // comReceive: () => void;
}