// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useContext, ChangeEvent } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { useMeetingManager } from '../providers/MeetingProvider';
import { getErrorContext } from '../providers/ErrorProvider';
import Button from '../components/Button';
import Flex from '../components/Flex'
import FormField from '../components/FormField'
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import ModalBody from '../components/Modal/ModalBody';
import ModalHeader from '../components/Modal/ModalHeader';
import ModalButton from '../components/Modal/ModalButton';
import ModalButtonGroup from '../components/Modal/ModalButtonGroup';
import Spinner from '../components/Spinner';
import routes from '../constants/routes';

const StyledDiv = styled.div`
  display: block;
  min-height: 100%;
  margin: auto;
  padding: 1rem;

  @media (min-width: 600px) and (min-height: 600px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;

const StyledP = styled.p`
  color: '#616672',
  fontSize: '14px',
  margin: '0 0 0.5rem',
`;

const MeetingForm: React.FC = () => {
  const meetingManager = useMeetingManager();
  const [meetingId, setMeetingId] = useState('');
  const [inputName, setInputName] = useState('');
  const [attendeeRole, setAttendeeRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const { errorMessage, updateErrorMessage } = useContext(getErrorContext());
  const history = useHistory();

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const meeting = await meetingManager?.authenticate(meetingId, inputName, attendeeRole, 'us-east-1');
      console.log('Join meeting info ', meeting);
      history.push(routes.DEVICE);
    } catch (error) {
      updateErrorMessage(error.message);
    }
  };

  const closeError = (): void => {
    updateErrorMessage('');
    setMeetingId('');
    setInputName('');
    setIsLoading(false);
    setAttendeeRole('student');
  };

  const attendeeRoleOptions = [
    {
      value: 'student',
      label: 'Student',
    },
    {
      value: 'instructor',
      label: 'Instructor',
    }
  ];

  return (
    <StyledDiv>
    <form>
      <h1>Join a meeting</h1>
      <FormField
        field={Input}
        label="Meeting Id"
        value={meetingId}
        fieldProps={{
          name: 'meetingId',
          placeholder: 'Enter Meeting Id'
        }}
        onChange={(e: ChangeEvent<HTMLInputElement>): void =>
          setMeetingId(e.target.value)
        }
      />
      <FormField
        field={Input}
        label="Name"
        value={inputName}
        fieldProps={{
          name: 'inputName',
          placeholder: 'Enter Your Name'
        }}
        onChange={(e: ChangeEvent<HTMLInputElement>): void =>
          setInputName(e.target.value)
        }
      />
      <FormField
        field={Select}
        options={attendeeRoleOptions}
        onChange={(e: ChangeEvent<HTMLInputElement>): void =>
          setAttendeeRole(e.target.value)
        }
        value={attendeeRole}
        label="Attendee Role"
      />
      <Flex
        container
        layout="fill-space-centered"
        style={{ marginTop: '2.5rem' }}
      >
        {isLoading ? (
          <Spinner />
        ) : (
          <Button variant='primary' label="Continue" onClick={handleJoinMeeting} />
        )}
      </Flex>
      {errorMessage && (
        <Modal size="medium" onClose={closeError}>
          <ModalHeader title={`Unable to join meeting: ${meetingId}`} />
          <ModalBody>
            <StyledP>
              Failed to join the meeting. {errorMessage}
            </StyledP>
          </ModalBody>
          <ModalButtonGroup
            primaryButtons={[<ModalButton variant="secondary" label="Cancel" closesModal />]}
          />
        </Modal>
      )}
    </form>
    </StyledDiv>
  );
};

export default MeetingForm;
