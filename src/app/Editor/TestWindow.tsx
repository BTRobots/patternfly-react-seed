import React, { FunctionComponent } from 'react';
import { Stage, Sprite } from '@inlet/react-pixi';
import { RobotListItem, getRobot } from '@app/storage';
import { Game } from '@app/Game/Game'

export interface TestWindowProps extends RobotListItem {
  programFile: string;
  height: string;
}

const TestWindow: FunctionComponent<TestWindowProps> = ({ programFile, height }) => (
  <div style={{minHeight: height}}>
    <Game
      height={height}
      robots={[]}
      width='300px'
      
    />
  </div>
)


export { TestWindow };