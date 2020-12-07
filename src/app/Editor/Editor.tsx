import React, {useState, useEffect} from 'react';
import { PageSection, Title, Bullseye, Gallery, GalleryItem, Grid, GridItem, Flex, FlexItem, Button, TextInput } from '@patternfly/react-core';
import { NewRobotCard } from './NewRobotCard';
import { getRobotList, saveRobot,  } from '@app/storage';
import { ControlledEditor } from '@monaco-editor/react';
import { RobotCard }from './RobotCard';
import { v4 as uuidV4 } from 'uuid';
import { TestWindow } from './TestWindow';

export interface RobotObject extends NewRobotObject {
  uuid: string,
}

export interface NewRobotObject {
  file: string,
  robotName: string,
}


const Editor: React.FunctionComponent<{}> = () => {
  const robots = getRobotList();
  const [currentRobot, setCurrentRobot] = useState<RobotObject>();
  const [isRunning, setIsRunning] = useState(false);
  const [codeError, setCodeError] = useState('');

  // we'll use user names after any auth is added
  const username = '';

  // save every 5 seconds
  const SAVE_INTERVAL = 5000;
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (currentRobot?.uuid) {
        saveRobot({
          username,
          ...currentRobot,
        });
      }
  
    }, SAVE_INTERVAL)
    return () => clearInterval(intervalId);
  }, [currentRobot]);


  const newRobotFile = ({robotName, file }: NewRobotObject) => {
    const newRobotObject: RobotObject = {
      robotName,
      file,
      uuid: uuidV4(),
    }
    saveRobot({
      username,
      ...newRobotObject,
    });
    setCurrentRobot(newRobotObject);
  }

  const handleSetRobot = (robotObject:RobotObject) => {
      saveRobot(robotObject);
      setCurrentRobot(robotObject);
  }

  let content;


  if (currentRobot) {
    content = (
      <div>
        <Grid>
          <GridItem span={6}>
            <TestWindow
              height="800px"
              programFile={currentRobot.file}
            />
          </GridItem>
          <GridItem span={6}>

            <Flex>
              <FlexItem>Robot:</FlexItem>
              <FlexItem><TextInput
                value={currentRobot.robotName}
                onChange={(value) => setCurrentRobot({...currentRobot, robotName: value})}
                  />
              </FlexItem>
              {!isRunning &&
                <FlexItem>
                  <Button onClick={() => setIsRunning(true)}>Run</Button>
                </FlexItem>
              }
              {isRunning &&
                <FlexItem>
                  <Button onClick={() => setIsRunning(false)}>Stop</Button>
                </FlexItem>
              }
            </Flex>
            <ControlledEditor
              height="800px"
              onChange={(ev, file) => setCurrentRobot({
                ...currentRobot,
                file: file || '',
              })}
              value={currentRobot.file}
            />
          </GridItem>
        </Grid>
      </div>
    )
  } else {
    content = robots.length > 0
    ? (
    <Gallery>
      <GalleryItem key='newRobot'>
        <NewRobotCard newRobotFile={newRobotFile}/>
      </GalleryItem>
      {robots.map(robot => (
      <GalleryItem key={robot.uuid}>
        <RobotCard
          name={robot.name}
          uuid={robot.uuid}
          username={username}
          loadRobotFile={setCurrentRobot}
        />
      </GalleryItem>))}</Gallery>
    )
    : (
      <Bullseye>
        <NewRobotCard newRobotFile={newRobotFile}/>
      </Bullseye>
    );
  }


  return (
    <PageSection>
      {content}
    </PageSection>
  );
}


export { Editor };
