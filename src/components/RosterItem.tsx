import React from 'react';
import styled from 'styled-components';

import useAttendeeRealtimeAudio from '../hooks/useAttendeeRealtimeAudio';
import { useVideoSendingService } from '../providers/VideoSendingProvider';
import { useMeetingManager } from '../providers/MeetingProvider';
import { SendVideoMessageType } from '../types';

const StyledRosterItem = styled.div`
  display: flex;

  .attendee-name {
    flex-grow: 1;
  }

  .active-speaker-status {
    width: 3rem;
  }

  p {
    margin: 1rem;
  }
`;

type Props = {
  id: string;
  name: string;
  isActiveSpeaker: boolean;
  videoEnabled?: boolean;
  videoSending?: boolean;
  attendeeRole?: string;
};

const RosterItem = (props: Props) => {
  const { id, name, isActiveSpeaker, videoEnabled, videoSending, attendeeRole } = props;
  const { muted } = useAttendeeRealtimeAudio(id);
  const videoSendingService = useVideoSendingService();
  const meetingManager = useMeetingManager();

  return (
    <StyledRosterItem>
      <p className="attendee-name">{name}</p>
      <p>{muted ? 'muted' : 'not muted'}</p>
      <p className="active-speaker-status">
        {isActiveSpeaker ? 'speaking' : ''}
      </p>
      { attendeeRole !== 'instructor' && videoEnabled &&
        <p>
          <span>View this video: </span>
          <input
            type="checkbox"
            value={"" + videoSending}
            checked={videoSending}
            onChange={(event) => videoSendingService?.sendMessage({
              type: SendVideoMessageType.TOGGLE_STUDENT_VIDEO,
              payload: {
                meetingId: meetingManager.meetingId || '',
                attendeeId: id,
                isSendingVideo: event.target.checked,
              }
            })} />
        </p>
      }
    </StyledRosterItem>
  );
};

export default RosterItem;
