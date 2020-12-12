import React, { FunctionComponent, useState, DragEvent } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  FileUpload,
  Form,
  FormGroup,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { EditIcon } from '@patternfly/react-icons';
import { v4 as uuidV4 } from 'uuid';
import { RobotObject } from './Editor';
import { RobotListItem, getRobot, deleteRobot } from '@app/storage';

export interface RobotCardProps extends RobotListItem {
  username: string,
  loadRobotFile: (input: RobotObject) => void,
  deleteRobot: (input: {username: string, uuid: string}) => void,
}

const RobotCard: FunctionComponent<RobotCardProps> = ({ username, name, uuid, loadRobotFile, deleteRobot }) => (
  <Card >
    <CardHeader>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween'}}>
        <FlexItem>{name}</FlexItem>
        <FlexItem><Button variant='primary' onClick={() => loadRobotFile({
            robotName: name,
            uuid,
            file: getRobot({ username, uuid }),
          })}><EditIcon/></Button>
        </FlexItem>
        <FlexItem><Button variant='secondary' onClick={() => deleteRobot({username, uuid})}>X</Button></FlexItem>
      </Flex>
      </CardHeader>
  </Card>
)


export { RobotCard };