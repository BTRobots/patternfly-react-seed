import * as fs from 'fs';
import * as path from 'path';
import { compile } from './compile';

const sourceFileExtention = '.at2';
const machineCodeFileExtention = '.mch';
const robotFolder = path.join(__dirname, '../../robotFiles');

const dirContents: string[] = fs.readdirSync(robotFolder);
const robotsToTest: string[] = [
  '1blood2',
  'assassin',
  'barabbas',
  'circles',
  'coroner',
  'dalek',
  'firebot1',
  'helpfire',
  'litesout',
  'max',
  'mj',
  'mj6',
  'oldfire',
  'overheat',
  'philbot',
  'rambot',
  'rammer',
  'randman3',
  'scantest',
  'sduck',
  'sniper',
  'sniper2',
  'straight',
  'sweeper',
  'theory',
  'tracker',
  'tracon',
  'trapper',
  'ub091',
  'wallbomb',
  'warblade',
  'weave',
  'weaver',
  'zitgun',
];
const testCases: [string, string, string[]][] = dirContents
  .filter(fileName => fileName.endsWith(sourceFileExtention))
  .filter(fileName => robotsToTest.includes(fileName.split('.')[0]))
  .map((fileName) => {
    const prefix = fileName.split('.')[0];
    const test: [string, string, string[]] = [
      prefix,
      fs.readFileSync(path.join(robotFolder, fileName), 'utf-8'),
      fs.readFileSync(path.join(robotFolder, `${prefix}${machineCodeFileExtention}`), 'utf-8').split(/\r?\n/),
    ];
    return test;
  });

describe('compiler', () => {
  for (const [robotName, robot_file, machine] of testCases) {
    describe(`legacy robot code: ${robotName}`, () => {
      let error: string | null = null;
      try {
        const compilerOutput = compile({
          robot_file,
          // debug_logging: true,
        });
        compilerOutput.robot_config.program.forEach((programLine, index) => {
          it(`line ${index} should equal the known output`, () => {
            expect(programLine.join(' ').trim()).toEqual(machine[index].trim());
          });
        });
      } catch (err) {
        error = err.message;
      }
      it('should not error', () => {
        expect(error).toBeNull();
      });
    });
  }
});
