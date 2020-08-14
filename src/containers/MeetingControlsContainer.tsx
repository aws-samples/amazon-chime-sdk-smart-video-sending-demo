import React from 'react';

import { useMeetingManager } from '../providers/MeetingProvider';
import AudioInputControl from './AudioInputControl';
import VideoInputControl from './VideoInputControl';
import AudioOutputControl from './AudioOutputControl';
import EndMeetingControl from './EndMeetingControl';

const MeetingControlsContainer: React.FC = () => {
  const meetingManager = useMeetingManager();
  const meetingId = meetingManager?.meetingId;
  const region = meetingManager?.region;

  return (
    <div className="MeetingControlContainer" style={{ display: "flex" }}>
      <p>{`${meetingId} (${region})`}</p>
      <AudioInputControl />
      <VideoInputControl />
      <AudioOutputControl />
      <EndMeetingControl />
    </div>
  );
}

export default MeetingControlsContainer;
