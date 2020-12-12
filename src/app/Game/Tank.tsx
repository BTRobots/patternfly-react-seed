import React, { FunctionComponent } from 'react';
import { Sprite } from 'react-pixi-fiber';
import { Spritesheet } from 'pixi.js';

export interface TankProps {
  spritesheet: Spritesheet
  x: number,
  y: number,
  scale: number, // ??
  turretRotation: number, // radians
  tankRotation: number, // radians
  body: Matter.Body, // hitbox
  tick: () => void, // move forward
}
export const Tank: FunctionComponent<TankProps> = ({
  spritesheet,
  x,
  y,
  turretRotation,
  tankRotation,
  body
}) => {
  return (
    <Sprite
      texture={spritesheet.textures['Hulls_Color_A/Hull_01.png']}
      x={x}
      y={y}
      scale={.5}
      rotation={tankRotation}
    >
      <Sprite
        texture={spritesheet.textures['Weapon_Color_A_256X256/Gun_01.png']}
        y={20}
        rotation={turretRotation}
      />
    </Sprite>
  );
}