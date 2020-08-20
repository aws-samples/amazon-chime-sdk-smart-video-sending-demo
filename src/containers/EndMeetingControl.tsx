import React, { useState } from 'react';
import { faSignOutAlt, faPowerOff } from '@fortawesome/free-solid-svg-icons'
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { useMeetingManager } from '../providers/MeetingProvider';
import { useMeetingStatus, MeetingStatus } from '../providers/MeetingStatusProvider';
import { useVideoSendingService, DEFAULT_WEB_SOCKET_TIMEOUT_MS } from '../providers/VideoSendingProvider';
import IconButton from '../components/IconButton';
import ButtonGroup from '../components/ButtonGroup';
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

const EndMeetingControl: React.FC = () => {
  const meetingManager = useMeetingManager();
  const history = useHistory();
  const [showEndModal, setShowEndModal] = useState(false);
  const { updateMeetingStatus } = useMeetingStatus();
  const messagingService = useVideoSendingService();

  const toggleEndMeeting = (): void => {
    setShowEndModal(!showEndModal);
  }

  const closeWS = () => {
    try {
      messagingService?.websocket?.close(DEFAULT_WEB_SOCKET_TIMEOUT_MS);
      console.log('Closing web socket');
    } catch (error) {
      console.error(`Unable to send close message on messaging socket: ${error}`);
    }
  }

  const endMeeting = async (): Promise<void> => {
    await meetingManager?.endMeeting();
    updateMeetingStatus(MeetingStatus.Ended);
    closeWS();
    history.push(routes.HOME);
  }

  const leaveMeeting = async (): Promise<void> => {
    await meetingManager?.leaveMeeting();
    closeWS();
    history.push(routes.HOME);
  }

  return (
    <>
      <ButtonGroup>
        <IconButton icon={faSignOutAlt} onClick={leaveMeeting} />
        <IconButton icon={faPowerOff} onClick={toggleEndMeeting} />
      </ButtonGroup>
      {showEndModal && (
        <Modal size="medium" onClose={toggleEndMeeting} rootId="modal-root">
        <ModalHeader title="End Meeting" />
        <ModalBody>
          <StyledP>
            Are you sure you want to end the meeting for everyone? The meeting
            cannot be used after ending it.
          </StyledP>
        </ModalBody>
        <ModalButtonGroup
          primaryButtons={[
            <ModalButton
              onClick={endMeeting}
              variant="primary"
              label="End meeting for all"
              closesModal
            />,
            <ModalButton variant="secondary" label="Cancel" closesModal />
          ]}
        />
      </Modal>
      )}
    </>
  );
}

export default EndMeetingControl;
