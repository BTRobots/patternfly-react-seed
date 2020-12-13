/* original navigation used this odd hex:

   Navigation is done in a 256 degree circle, with 0 being north. Here are
the directions for each course:

                     0 (256)                            000h (100h)
    Decimal:         |               Hexidecimal:        |
                224  |  32                         0E0h  |   020h
                   \ | /                               \ | /
           192 ----- + ----- 64               0C0h ----- + ----- 040h
                   / | \                               / | \
                160  |   96                        0A0h  |   060h
                     |                                   |
                    128                                 080h

But the physics engine and renderer use raidans:

                    π/2
    Radians:         |
               3π/4  |  π/4
                   \ | /
             π ----- + ----- 0 (2π)
                   / | \
               5π/4  |  7π/4
                     |
                  3π/2

This requires a π/2 rotation and inversion
*/

export const degreesToRadians = (degrees: number) => (degrees % 360) * Math.PI / 180;

export const radiansToDegrees = (radians: number) => (radians * 180 / Math.PI) % 360;

export const degreesToRobot = (degrees: number) => (360 + (degrees * -1) + 90) % 360 / 360 * 256

export const robotToDegrees = (robot: number) => (256 + (robot * -1) + 64) % 256 / 256 * 360

export const robotToRadians = (decimal: number) => {
  return degreesToRadians(robotToDegrees(decimal));
}

export const radiansToRobot = (radians: number) => {
  return degreesToRobot(radiansToDegrees(radians));
}

const preceision = 100.0;
export const radianRound = (radian) => Math.floor(radian * preceision) / preceision;

export const radianCompare = (radian1, radian2) => {
   const roundedRadian1 = Math.floor(radian1 * preceision);
   const roundedRadian2 = Math.floor(radian2 * preceision);

   
}