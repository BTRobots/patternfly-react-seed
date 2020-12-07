import React, { FunctionComponent, useState, DragEvent } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, FileUpload, Form, FormGroup } from '@patternfly/react-core';
import { NewRobotObject, RobotObject } from './Editor';

export interface NewRobotCardProps {
  newRobotFile: (input: NewRobotObject) => void,
}

const NewRobotCard: FunctionComponent<NewRobotCardProps> = ({ newRobotFile }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [filename, setFilename] = useState('');
    const [isRejected, setIsRejected] = useState(false);
    const [value, setValue] = useState<string>();
    const handleFileChange = (value: string | File, filename: string, event) => {
      setValue(value.toString());
      setFilename(filename);
      setIsRejected(false);
    }
    const handleFileRejected = () => setIsRejected(true);
    const handleFileReadStarted = () => setIsLoading(true);
    const handleFileReadFinished = async (fileHandle: File) => {
      console.log('handleFileReadFinished');
      setIsLoading(false);
      newRobotFile({
        file: await fileHandle.text(),
        robotName: fileHandle.name,
      });

    };

    return (
      <Card>
        <CardHeader>Create New Robot</CardHeader>
        <CardBody>
          <Form>
            <FormGroup 
              fieldId='newRobotUploadFieldGroup'
              helperText='Upload a robot program'
              helperTextInvalid="Must be a valid text file!!"
              validated={isRejected ? 'error' : 'default'}
              >
                <FileUpload 
                  id="newRobotUploadField"
                  type='dataURL'
                  value={value}
                  filename={filename}
                  onChange={handleFileChange}
                  onReadStarted={handleFileReadStarted}
                  onReadFinished={handleFileReadFinished}
                  isLoading={isLoading}
                  dropzoneProps={{
                    accept: '.at2',
                    onDropRejected: handleFileRejected,
                  }}
                  validated={isRejected ? 'error' : 'default'}
                />
            </FormGroup>
          </Form>
          </CardBody>
        <CardFooter><Button component='a' variant='secondary' onClick={() => newRobotFile({
          robotName: 'New', 
          file: ''
          })}>New Blank Robot</Button></CardFooter>
      </Card>
    )
}

export { NewRobotCard };