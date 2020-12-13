import React, {useEffect, useState, useRef} from 'react';
import {
  PageSection, 
  Select,
  SelectOption,
  SelectVariant,
  Button,
  Flex,
  FlexItem,
  Card,
  CardHeader,
  CardBody,
} from '@patternfly/react-core';
import { getRobotList, getRobot } from '@app/storage';
import { Game } from '../Game/Game';

const Battle: React.FunctionComponent<{}> = () => {
  const robotList = getRobotList();
  const [selectedRobots, setSelectedRobots] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [robotFiles, setRobotFiles] = useState<string[]>();
  const [ cycleCount, setCycleCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>();

  // select state
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
  }

  const handleOnSelect = (event, selection) => {
    if (selectedRobots.includes(selection)) {
      setSelectedRobots(selectedRobots.filter(i => i === selection));
    } else {
      setSelectedRobots([...selectedRobots, selection]);
    }
  }

  const handleClearSelection = () => {
    setSelectedRobots([]);
  }

  const startGame = () => {
    setStarted(true);
    console.log(selectedRobots)
    console.log(robotList);
    const programs = robotList
      .filter(rList => selectedRobots.includes(rList.name))
      .map(robot => getRobot({
        username: '',
        uuid: robot.uuid,
      }));
      setRobotFiles(programs);
  }

  return (
    <PageSection>
      <Flex>
        <FlexItem>
        Select your robots
        </FlexItem>
        <FlexItem>
        <Select
          variant={SelectVariant.typeaheadMulti}
          typeAheadAriaLabel="Select Robots to battle"
          onToggle={handleToggle}
          onSelect={handleOnSelect}
          onClear={handleClearSelection}
          selections={selectedRobots}
          isOpen={isOpen}
          isCreatable={false}
        >
          {robotList.map((robot, index) => (
            <SelectOption 
              key={index}
              value={robot.name}
            />
          ))}
        </Select>
        </FlexItem>
        <FlexItem>
          <Button disabled={started} onClick={startGame}>Start Battle!</Button>
        </FlexItem>
        <FlexItem><p>{cycleCount}</p></FlexItem>
      </Flex>
        <Flex >
          <FlexItem width={840}>
            <canvas ref={canvasRef}></canvas>
            {started && <Game
              isRunning={started}
              height={600}
              width={800}
              robotsPrograms={robotFiles}
              canvas={canvasRef?.current}
            />}
          </FlexItem>
          <FlexItem>
            {selectedRobots.map((robot) => (
              <Card>
                <CardHeader>
                  {robot}
                </CardHeader>
                <CardBody>
                  Health: 1000, Heat: 0
                </CardBody>
              </Card>
            ))}

          </FlexItem>
        </Flex>
    </PageSection>
  );
};

export { Battle };
