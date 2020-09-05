// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useMeetingManager } from '../providers/MeetingProvider';
import useVideoSendingMessaging from '../hooks/useVideoSendingMessaging';
import AudioInputControl from './AudioInputControl';
import VideoInputControl from './VideoInputControl';
import AudioOutputControl from './AudioOutputControl';
import EndMeetingControl from './EndMeetingControl';

const MeetingControlsContainer: React.FC = () => {
  const meetingManager = useMeetingManager();
  const meetingId = meetingManager?.meetingId;
  const region = meetingManager?.region;

  useVideoSendingMessaging();

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
