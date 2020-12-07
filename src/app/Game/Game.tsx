import React, { FunctionComponent, useEffect, useState } from 'react';
import { Stage } from '@inlet/react-pixi';
import { Loader } from 'pixi.js';

export interface GameProps {
  robots: any[],
  height: string,
  width: string,
  
}

const Game: FunctionComponent<GameProps> = ({ robots, height, width }) => {
  const [sheet, setSheet] = useState<PIXI.Spritesheet>();

  useEffect(() => {

    const SPRITESHEET_LOCATION = '../../../assets/spritesheet.json';
    if (!Loader.shared.resources[SPRITESHEET_LOCATION]?.spritesheet) {
      Loader.shared.add(SPRITESHEET_LOCATION).load(() => {
        setSheet(Loader.shared.resources[SPRITESHEET_LOCATION].spritesheet);
      })
    }
  });
  return !sheet
    ? <div>'Loading...'</div>
    : (<div style={{minHeight: height}}>

    </div>)
}


export { Game };