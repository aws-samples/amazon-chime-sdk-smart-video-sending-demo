import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { useMeetingManager } from '../providers/MeetingProvider';
import Button from '../components/Button';
import { Flex } from '../components/Flex';
import Label from '../components/Label';
import Modal from '../components/Modal';
import ModalBody from '../components/Modal/ModalBody';
import ModalHeader from '../components/Modal/ModalHeader';
import ModalButton from '../components/Modal/ModalButton';
import ModalButtonGroup from '../components/Modal/ModalButtonGroup';
import routes from '../constants/routes';

const StyledP = styled.p`
  color: '#616672',
  fontSize: '14px',
  margin: '0 0 0.5rem',
`;

const MeetingJoinDetails = () => {
  const meetingManager = useMeetingManager();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const meetingId = meetingManager?.meetingId || '';
  const attendeeName = meetingManager?.attendeeName;

  const handleJoinMeeting = async () => {
    setIsLoading(true);

    try {
      await meetingManager.join();
      setIsLoading(false);
      history.push(`${routes.MEETING}/${meetingId}`);
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
    }
  };

  return (
    <>
      <Flex container alignItems="center" flexDirection="column">
        <Button
          variant="primary"
          label={isLoading ? 'Loading...' : 'Join meeting'}
          onClick={handleJoinMeeting}
        />
        <Label style={{ margin: '.75rem 0 0 0' }}>
          Joining meeting <b>{meetingId}</b> as <b>{attendeeName}</b>
        </Label>
      </Flex>
      {error && (
        <Modal size="medium" onClose={() => setError('')}>
          <ModalHeader title={`Unable to join meeting: ${meetingId}`} />
          <ModalBody>
            <StyledP>
              Failed to join the meeting. {error}
            </StyledP>
          </ModalBody>
          <ModalButtonGroup
            primaryButtons={[<ModalButton variant="secondary" label="Cancel" closesModal />]}
          />
        </Modal>
      )}
    </>
  );
};

export default MeetingJoinDetails;
