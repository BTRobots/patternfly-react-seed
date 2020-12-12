import React, { FunctionComponent } from 'react';
import { RobotListItem, getRobot } from '@app/storage';
import { Game } from '@app/Game/Game'
import { Robot } from '../../core/types';

export interface TestWindowProps extends RobotListItem {
  programFile: string;
  height: number;
}

const TestWindow: FunctionComponent<TestWindowProps> = ({ programFile, height }) => (
  <div style={{minHeight: height}}>
    <Game
      height={height}
      width={800}
      robotsPrograms={[programFile]}
    />
  </div>
)


export { TestWindow };