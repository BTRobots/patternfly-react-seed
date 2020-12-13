import React, { FunctionComponent, useEffect, useState, useRef } from 'react';
import { PointLikeNumber, Stage } from 'react-pixi-fiber';
import spritesheetJSON from '../../../assets/spritesheet2.json';
import spritesheetUrl from '../../../assets/spritesheet.png';
import { Spritesheet, BaseTexture, Texture, resources, Loader, Sprite } from 'pixi.js';
import { Engine, Runner, Composite, Composites, Common, World, Bodies, Constraint, Vector } from 'matter-js';
import { Tank } from './Tank';
import { Robot } from '../../core/types'
import { RobotVMFactory } from '../../core/RobotVM';
import { compile } from '../../core';
import { Render } from './PixiRender';


const defaultCollisionCategory = 0x0001;
const tankCollisionCategory = 0x0002;
const turretCollisionCategory = 0x0004;

export interface GameProps {
  robotsPrograms: string[],
  height: number,
  width: number,
  isRunning: boolean,
  randomStartLocations?: boolean,
  canvas?: HTMLCanvasElement,
}

const getStartXPosition = (mapWidth: number) => {
  return Math.floor(mapWidth * .9 * Math.random()) + (Math.floor(mapWidth * .05));
}
const getStartYPosition = (mapHeight: number) => {
  return Math.floor(mapHeight * .9 * Math.random()) + (Math.floor(mapHeight * .05));
}

const Game: FunctionComponent<GameProps> = ({ robotsPrograms, height, width, isRunning, canvas }) => {
  const [spritesheet, setSpritesheet] = useState<Spritesheet>();
  const tankScale = .25;
  const worldRef = useRef(null);
  const [bodies, setBodies] = useState<Matter.Body[]>();
  const [render, setRender] = useState<Render>();


  useEffect(() => {
    if (isRunning) {
      let render;
      (async () => {
        const spritesheet = new Spritesheet(BaseTexture.from(spritesheetUrl), spritesheetJSON);
        await new Promise((res, rej) => {
          spritesheet.parse(res);
        });

      // compile
        const robotConfigs = robotsPrograms.map(robot_file => compile({ robot_file })).map(i => i.robot_config);

        const engine = Engine.create();
        engine.world.gravity.x = 0;
        engine.world.gravity.y = 0;
        
        // see https://stackoverflow.com/questions/33569688/change-default-canvas-size-in-matterjs
        canvas?.width = width;
        canvas?.height = height;

        render = Render.create({
          view: canvas || worldRef,
          canvas,
          engine,
          spritesheet,
          options: {
            width,
            height,
            wireframes: false,
          }
        });
        let robotVMs = robotConfigs.map(rConfig => RobotVMFactory(rConfig));

        const tankWidth = spritesheet?.textures['Hulls_Color_A/Hull_01.png'].width * tankScale;
        const tankHeight = spritesheet?.textures['Hulls_Color_A/Hull_01.png'].height * tankScale;
        const turretWidth = spritesheet?.textures['Weapon_Color_A_256X256/Gun_01.png'].width * tankScale;
        const turretHeight = spritesheet?.textures['Weapon_Color_A_256X256/Gun_01.png'].height * tankScale;



        const tankStartXPosition = robotVMs.length === 1
          ? width / 2
          : getStartXPosition(width);
        const tankStartYPosition = robotVMs.length === 1
          ? height /2
          : getStartYPosition(height);
        const tankComposites = robotVMs.map((vm, index) => {
          const tankBody = Bodies.rectangle(
            tankStartXPosition,
            tankStartYPosition,
            tankWidth,
            tankHeight,
            {
              id: index,
              label: `tank_${index}`,
              // angle: Math.floor(2 * Math.PI * Math.random()), // random angle
              collisionFilter: {
                category: tankCollisionCategory,
                // group: -1,
                mask: defaultCollisionCategory | tankCollisionCategory,
              },
              density: 100,
              frictionAir: 1,
              render: {
                sprite: {
                  texture: 'Hulls_Color_A/Hull_01.png',
                }
              }
            });
          const turretBody = Bodies.rectangle(
            tankStartXPosition,//tankBody.position.x,
            tankStartYPosition,//tankBody.position.y,
            turretWidth,
            turretHeight,
            {
              id: index+100,
              angle: tankBody.angle,
              frictionAir: 1,
              collisionFilter: {
               // category: turretCollisionCategory,
               // group: -1,
                category: turretCollisionCategory,
                mask: 0x000F, // NONE
                // group: -1,
              },
              density: 0.001,
              label: `turret_${index}`,
              render: {
                sprite: {
                  texture: 'Weapon_Color_A_256X256/Gun_01.png',
                }
              }
            }
          )
          
          const turretConstraint = Constraint.create({
            bodyA: tankBody,
            pointA: { x: 0, y: 4},
            bodyB: turretBody,
            damping: 0,
            stiffness: 1,
          })

          return Composite.create({
            bodies: [
              tankBody,
              turretBody,
            ],
            constraints: [
             turretConstraint
            ]
          });
        });
        /*
        const _bodies = robotVMs.map((vm, index) => Bodies.rectangle(
            getStartXPosition(width),
            getStartYPosition(height),
            spritesheet?.textures['Hulls_Color_A/Hull_01.png'].width * tankScale,
            spritesheet?.textures['Hulls_Color_A/Hull_01.png'].height * tankScale,
            {
              id: index,
              angle: Math.floor(2 * Math.PI * Math.random()), // random angle
              render: {
                sprite: {
                  texture: 'Hulls_Color_A/Hull_01.png',
                }
              }
            }
        ));*/
            
        // robotVMs.forEach(rConfig => Render.addChildren(render, new Sprite(
        //  spritesheet?.textures['Hulls_Color_A/Hull_01.png'])));
        
        tankComposites.forEach(tc => World.addComposite(engine.world, tc));

        // World.add(engine.world, tankComposites);

        const wallOptions = {
          isStatic: true,
          collisionFilter: {
            category: defaultCollisionCategory,
          }
        }
        const wallThickness = 10;
        World.add(engine.world, [
          // walls
          Bodies.rectangle(0, 0, width, wallThickness, {...wallOptions, label: 'wall_top' }),

          Bodies.rectangle(0, height - wallThickness , width, wallThickness, {...wallOptions, label: 'wall_bottom' }),

          Bodies.rectangle(0, 0, wallThickness, height, {...wallOptions, label: 'wall_left' }),
          Bodies.rectangle(width - wallThickness, 0, wallThickness, height, {...wallOptions, label: 'wall_right' }),
        ]);

        Engine.run(engine);
        Render.run(render, engine, robotVMs, () => {}, (cycleCount) => console.log(cycleCount));
      })();

        
    }
    return () => {
      if (render) {
        Render.stop(render)
        Engine.clear(engine);
      }
    }

  }, [isRunning])

  return <div style={{
    position: 'absolute',
    top: '50px',
    left: '100px',
  }}ref={worldRef}></div>;
}

//<Sprite texture={Texture.from('Hulls_Color_A/Hull_01.png')}/>
export { Game };