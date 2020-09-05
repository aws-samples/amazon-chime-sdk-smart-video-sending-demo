// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useMeetingManager } from '../providers/MeetingProvider';
import { MeetingStatusProvider } from '../providers/MeetingStatusProvider';
import { VideoSendingProvider } from '../providers/VideoSendingProvider';
import { LocalVideoToggleProvider } from '../providers/LocalVideoToggleProvider';
import { useMeetingStatus, MeetingStatus } from '../providers/MeetingStatusProvider';
import MeetingControlsContainer from './MeetingControlsContainer';
import MeetingRoster from './MeetingRoster';
import RemoteVideoGrid from './RemoteVideoGrid';
import routes from '../constants/routes';
import { RosterProvider } from '../providers/RosterProvider';

const MeetingView = () => {
  const { meetingStatus } = useMeetingStatus();
  const meetingManager = useMeetingManager();
  const meetingId = meetingManager?.meetingId;
  const history = useHistory();

  useEffect(() => {
    if (meetingStatus === MeetingStatus.Ended || meetingStatus === MeetingStatus.Failed || !meetingId) {
      meetingManager.leaveMeeting();
      history.push(routes.HOME);
    }
  });

  return (
    <MeetingStatusProvider>
      <VideoSendingProvider>
        <LocalVideoToggleProvider>
          <RosterProvider>
            <MeetingControlsContainer />
            <MeetingRoster />
            <RemoteVideoGrid />
          </RosterProvider>
        </LocalVideoToggleProvider>
      </VideoSendingProvider>
    </MeetingStatusProvider>
  );
};

export default MeetingView;
