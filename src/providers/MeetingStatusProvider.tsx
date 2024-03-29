// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import {
  MeetingSessionStatus,
  MeetingSessionStatusCode,
  VideoTileState
} from 'amazon-chime-sdk-js';

import { useMeetingManager } from './MeetingProvider';
import { useAudioVideo } from './AudioVideoProvider';
import routes from '../constants/routes';

enum MeetingStatus {
  Loading,
  Succeeded,
  Failed,
  Ended
};

type MeetingContextType = {
  meetingStatus: MeetingStatus;
  updateMeetingStatus: (s: MeetingStatus) => void;
};

type Props = {
  children: ReactNode;
  joinMuted?: boolean;
  joinWithVideo?: boolean;
};

const MeetingStatusContext = createContext<MeetingContextType>({
  meetingStatus: MeetingStatus.Loading,
  updateMeetingStatus: (s: MeetingStatus) => {}
});

function MeetingStatusProvider(props: Props) {
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const [meetingStatus, setMeetingStatus] = useState(MeetingStatus.Loading);
  const meetingId = meetingManager?.meetingId;
  const { children } = props;
  const history = useHistory();

  useEffect(() => {
    if (!audioVideo) {
      return;
    }

    const audioVideoDidStart = () => {
      console.log('Observer audioVideoDidStart');
    };

    const videoTileDidUpdate = (tileState: VideoTileState) => {
      if (!tileState.boundAttendeeId) {
        return;
      }
      if (tileState?.boundAttendeeId && tileState?.tileId) {
        setMeetingStatus(MeetingStatus.Succeeded);
      }
    };

    const videoTileWasRemoved = (tileId: number) => {
      setMeetingStatus(MeetingStatus.Succeeded);
    };

    const audioVideoDidStop = (sessionStatus: MeetingSessionStatus) => {
      const sessionStatusCode = sessionStatus.statusCode();
      if (sessionStatusCode === MeetingSessionStatusCode.Left) {
        /*
          - You called meetingSession.audioVideo.stop().
          - When closing a browser window or page, Chime SDK attempts to leave the session.
        */
        console.log('You left the session');
      } else if (
        sessionStatusCode === MeetingSessionStatusCode.MeetingEnded
      ) {
        console.log('The session has ended');
        // If remote attendee ends the meeting (not leaving ending the meeting for all), then self-leave on rest of the connected clients.
        meetingManager.leaveMeeting();
        history.push(routes.HOME);
      } else {
        console.log(
          'Observer audioVideoDidStop, Stopped with a session status code: ',
          sessionStatusCode
        );
      }
    };

    const observers: any = {
      videoTileDidUpdate,
      audioVideoDidStart,
      videoTileWasRemoved,
      audioVideoDidStop
    };

    setMeetingStatus(MeetingStatus.Succeeded);
    audioVideo.addObserver(observers);

    return () => {
      setMeetingStatus(MeetingStatus.Ended);
      audioVideo.removeObserver(observers);
    };
  }, [meetingId]);

  const updateMeetingStatus = (status: MeetingStatus): void => {
    setMeetingStatus(status);
  };

  const value = {
    meetingStatus,
    updateMeetingStatus
  };

  return (
    <MeetingStatusContext.Provider value={value}>
      {children}
    </MeetingStatusContext.Provider>
  );
}

function useMeetingStatus(): MeetingContextType {
  const context = useContext(MeetingStatusContext);
  return context;
}

export { MeetingStatusProvider, useMeetingStatus, MeetingStatus };
