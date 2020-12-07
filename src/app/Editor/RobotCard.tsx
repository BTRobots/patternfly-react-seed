import React, { FunctionComponent, useState, DragEvent } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, FileUpload, Form, FormGroup } from '@patternfly/react-core';
import { v4 as uuidV4 } from 'uuid';
import { RobotObject } from './Editor';
import { RobotListItem, getRobot } from '@app/storage';

export interface RobotCardProps extends RobotListItem {
  username: string,
  loadRobotFile: (input: RobotObject) => void,
}

const RobotCard: FunctionComponent<RobotCardProps> = ({ username, name, uuid, loadRobotFile }) => (
  <Card onClick={() => loadRobotFile({
    robotName: name,
    uuid,
    file: getRobot({ username, uuid }),
  })}>
    <CardHeader>{name}</CardHeader>
  </Card>
)


export { RobotCard };