// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useMeetingManager } from '../providers/MeetingProvider';
import { useMeetingStatus, MeetingStatus } from '../providers/MeetingStatusProvider';
import DeviceSelection from './DeviceSelection';
import JoinMeetingDetails from './MeetingJoinDetails';
import routes from '../constants/routes';

const StyledLayout = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  max-width: 85rem;
  padding: 1rem;
  margin: auto;

  @media (max-width: 760px) {
    border-right: unset;
    align-items: unset;
    justify-content: unset;
  }
`;

const DeviceSetup: React.FC = () => {
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
    <StyledLayout>
      <h1>Device settings</h1>
      <DeviceSelection />
      <JoinMeetingDetails />
    </StyledLayout>
  )
}

export default DeviceSetup;
