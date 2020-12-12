import { useState } from 'react';

enum Storage {
  ROBOT_LIST = 'ROBOT_LIST',
  ANONYMOUS = 'ANONYMOUS', 
  ROBOT_MAP = 'ROBOT_MAP',
}

export interface RobotListItem {
  name: string;
  uuid: string;
}

export interface GetRobotListInput {
  username?: String;
}
export const getRobotList = (input?: GetRobotListInput): RobotListItem[] => {
  const user = input?.username || Storage.ANONYMOUS;
  /*
  
  // get a list of all locally saved robots
  try {
    const item = localStorage.getItem(`${user}_${Storage.ROBOT_LIST}`);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Error getting local robots: ${error.message}`);
  }
  return [];
  */
  const robotMap = getRobotMap({ username: user });
  return Object.keys(robotMap).map((uuid) => ({ uuid, name: robotMap[uuid]}));
}

export interface SaveRobotInput {
  username?: string,
  robotName: string
  uuid: string,
  file: string,
}
export const saveRobot = ({
  username,
  robotName,
  uuid,
  file,
}: SaveRobotInput) => {
  const user = username || Storage.ANONYMOUS;
  
  // save robot
  localStorage.setItem(`${user}_${uuid}`, JSON.stringify(file));

  const robotMap = getRobotMap({ username: user });
  robotMap[uuid] = robotName;
  saveRobotMap({ username: user, robotMap });

  // save robot to list
  /*
  const robotList = getRobotList({ username: user });

  const newRobotListItem = { name: robotName || '', uuid, };

  // save to list if it doesn't exist
  if (!robotList.some((item) => item.name === robotName && item.uuid === robotList.uuid)) {
    robotList.push(newRobotListItem);
    saveRobotList({
      robotList,
      username: user,
    })
  }*/
}
// { uuid: name}
export interface SaveRobotMapInput {
  username?: string,
  robotMap: { [uuid: string]: string },
}
export const saveRobotMap = ({
  username,
  robotMap,
}: SaveRobotMapInput) => {
  const user = username || Storage.ANONYMOUS;
  localStorage.setItem(`${user}_${Storage.ROBOT_MAP}`, JSON.stringify(robotMap));
}


export interface GetRobotMapInput {
  username?: String;
}
export const getRobotMap = (input?: GetRobotMapInput): { [uuid: string]: string } => {
  const user = input?.username || Storage.ANONYMOUS;
  
  // get a list of all locally saved robots
  try {
    const item = localStorage.getItem(`${user}_${Storage.ROBOT_MAP}`);
    return item ? JSON.parse(item) : {};
  } catch (error) {
    console.error(`Error getting local robots: ${error.message}`);
  }
  return {};
}

export interface SaveRobotListInput {
  username?: string,
  robotList: RobotListItem[],
}
export const saveRobotList = ({
  username,
  robotList,
}: SaveRobotListInput) => {
  const user = username || Storage.ANONYMOUS;
  localStorage.setItem(`${user}_${Storage.ROBOT_LIST}`, JSON.stringify(robotList))
}

export interface GetRobotInput {
  username: string,
  uuid: string,
}
export const getRobot = ({
  username,
  uuid,
}: GetRobotInput) => {
  const user = username || Storage.ANONYMOUS;
  return JSON.parse(localStorage.getItem(`${user}_${uuid}`) || '{}');
}

export interface DeleteRobotInput {
  username: string,
  uuid: string,
}
export const deleteRobot = ({
  username,
  uuid,
}: DeleteRobotInput) => {
  const user = username || Storage.ANONYMOUS;
  // remove from local storage
  localStorage.removeItem(`${user}_${uuid}`);

  // remove from local storage list
  const robotMap = getRobotMap({ username: user });
  delete robotMap[uuid];
  saveRobotMap({ username: user, robotMap });
}

export const useLocalRobotStorage = (username: string) => {
  const [currentRobot, setCurrentRobot] = useState()
}