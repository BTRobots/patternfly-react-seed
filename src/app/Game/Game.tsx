import React, { FunctionComponent, useEffect, useState, useRef } from 'react';
import { PointLikeNumber, Stage } from 'react-pixi-fiber';
import spritesheetJSON from '../../../assets/spritesheet2.json';
import spritesheetUrl from '../../../assets/spritesheet.png';
import { Spritesheet, BaseTexture, Texture, resources, Loader, Sprite } from 'pixi.js';
import { Engine, Runner, Composites, Common, World, Bodies } from 'matter-js';
import { Tank } from './Tank';
import { Robot } from '../../core/types'
import { RobotVMFactory } from '../../core/RobotVM';
import { compile } from '../../core';
import { Render } from './PixiRender';


export interface GameProps {
  robotsPrograms: string[],
  height: number,
  width: number,
  isRunning: boolean,
  randomStartLocations?: boolean,
  canvas?: HTMLCanvasElement
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



  //useEffect(() => {


    // const sheet = new Spritesheet(BaseTexture.from(spritesheetUrl), spritesheetJSON);
    // setSpritesheet(sheet);
    // const t = Texture.from(spritesheetUrl, )
    //Loader.shared.add('tanks', spritesheetJSON);
    //Object.keys(sheet.data.frames).forEach(key => {
    //  Texture.addToCache(Texture.from(spritesheetUrl), key)
    //})
  //}, []);

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
        

        render = Render.create({
          view: canvas || worldRef,
          engine,
          spritesheet,
          options: {
            width,
            height,
            wireframes: false,
          }
        });
        let robotVMs = robotConfigs.map(rConfig => RobotVMFactory(rConfig));

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
        ));
            
        // robotVMs.forEach(rConfig => Render.addChildren(render, new Sprite(
        //  spritesheet?.textures['Hulls_Color_A/Hull_01.png'])));
        


        World.add(engine.world, _bodies);

        Engine.run(engine);
        Render.run(render, engine, robotVMs);
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