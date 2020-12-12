import {
  degreesToRadians,
  degreesToRobot,
  radiansToDegrees,
  radiansToRobot,
  robotToDegrees,
  robotToRadians
} from './radians';

describe('radians', () => {
  describe('degreesToRadians', () => {
    it('should convert 0 to 0', () => {
      expect(degreesToRadians(0)).toEqual(0);
    });
    it('should convert 90 to π/2', () => {
      expect(degreesToRadians(90)).toEqual(Math.PI/2);
    });
    it('should convert 180 to π', () => {
      expect(degreesToRadians(180)).toEqual(Math.PI);
    });
    it('should convert 270 to 3π/2', () => {
      expect(degreesToRadians(270)).toEqual(3 * Math.PI / 2);
    });
    it('should convert 360 to 0', () => {
      expect(degreesToRadians(360)).toEqual(0);
    });
  });
  describe('radiansToDegrees', () => {
    it('should convert 0 to 0', () => {
      expect(radiansToDegrees(0)).toEqual(0);
    });
    it('should convert π/2 to 90', () => {
      expect(radiansToDegrees(Math.PI / 2)).toEqual(90);
    });
    it('should convert π to 180', () => {
      expect(radiansToDegrees(Math.PI)).toEqual(180);
    });
    it('should convert 3π/2 to 270', () => {
      expect(radiansToDegrees(3 * Math.PI / 2)).toEqual(270);
    });
    it('should convert 2π to 0', () => {
      expect(radiansToDegrees(2 * Math.PI)).toEqual(0);
    });
  });
  describe('robotToDegrees', () => {
    it('should convert 0 to 90', () => {
      expect(robotToDegrees(0)).toEqual(90);
    });
    it('should convert 192 to 180', () => {
      expect(robotToDegrees(192)).toEqual(180);
    });
    it('should convert 128 to 270', () => {
      expect(robotToDegrees(128)).toEqual(270);
    });
    it('should convert 64 to 0', () => {
      expect(robotToDegrees(64)).toEqual(0);
    });
    it('should convert 256 to 90', () => {
      expect(robotToDegrees(256)).toEqual(90);
    });
  });
  describe('degreesToRobot', () => {
    it('should convert 0 to 64', () => {
      expect(degreesToRobot(0)).toEqual(64);
    });
    it('should convert 90 to 0', () => {
      expect(degreesToRobot(90)).toEqual(0);
    });
    it('should convert 180 to 192', () => {
      expect(degreesToRobot(180)).toEqual(192);
    });
    it('should convert 270 to 128', () => {
      expect(degreesToRobot(270)).toEqual(128);
    });
    it('should convert 360 to 64', () => {
      expect(degreesToRobot(360)).toEqual(64);
    });
  });
  describe('radiansToRobot', () => {
    it('should convert 0 to 64', () => {
      expect(radiansToRobot(0)).toEqual(64);
    });
    it('should convert π/2 to 0', () => {
      expect(radiansToRobot(Math.PI / 2)).toEqual(0);
    });
    it('should convert π to 192', () => {
      expect(radiansToRobot(Math.PI)).toEqual(192);
    });
    it('should convert 3π/2 to 128', () => {
      expect(radiansToRobot(3 * Math.PI / 2)).toEqual(128);
    });
    it('should convert 2π to 64', () => {
      expect(radiansToRobot(2 * Math.PI)).toEqual(64);
    });
  });
  describe('robotToRadians', () => {
    it('should convert 64 to 0', () => {
      expect(robotToRadians(64)).toEqual(0);
    });
    it('should convert 0 to π/2', () => {
      expect(robotToRadians(0)).toEqual(Math.PI/2);
    });
    it('should convert 192 to π', () => {
      expect(robotToRadians(192)).toEqual(Math.PI);
    });
    it('should convert 128 to 3π/2', () => {
      expect(robotToRadians(128)).toEqual(3 * Math.PI / 2);
    });
  });
});
