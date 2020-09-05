// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  useState,
  useEffect,
  useContext,
  useRef,
} from 'react';
import { DefaultModality } from 'amazon-chime-sdk-js';

import { useMeetingManager } from './MeetingProvider';
import { useAudioVideo } from './AudioVideoProvider';
import { useVideoSendingService } from './VideoSendingProvider';
import { SendVideoMessageType, RemoteMessage } from '../types';
import useVideoSendingMessaging from '../hooks/useVideoSendingmessaging';

type RosterAttendeeType = {
  id: string;
  name: string;
  videoEnabled?: boolean;
  videoSending?: boolean;
  attendeeRole?: string;
};

type RosterType = {
  [attendeeId: string]: RosterAttendeeType;
};


const RosterContext = React.createContext<RosterType>({});

const RosterProvider: React.FC = ({ children }) => {
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const videoSendingService = useVideoSendingService();
  const rosterRef = useRef<RosterType>({});
  const [roster, setRoster] = useState<RosterType>({});

  useVideoSendingMessaging();

  useEffect(() => {
    if (!audioVideo || !videoSendingService) {
      return;
    }

    const rosterUpdateCallback = async (
      presentAttendeeId: string,
      present: boolean
    ): Promise<void> => {
      if (!present) {
        delete rosterRef.current[presentAttendeeId];
        setRoster((currentRoster: RosterType) => {
          const { [presentAttendeeId]: _, ...rest } = currentRoster;
          return { ...rest };
        });

        return;
      }

      const attendeeId = new DefaultModality(presentAttendeeId).base();
      if (attendeeId !== presentAttendeeId) {
        return;
      }

      const inRoster = rosterRef.current[presentAttendeeId];
      if (inRoster) {
        return;
      }

      const attendee = await meetingManager.getAttendeeInfo(attendeeId);
      if (!attendee) {
        return;
      }

      rosterRef.current[attendeeId] = attendee;
      setRoster(oldRoster => ({
        ...oldRoster,
        [attendeeId]: attendee,
      }));

      if (meetingManager.role === 'instructor') {
        videoSendingService.sendMessage({
          type: SendVideoMessageType.LIST_AVAILABLE_VIDEOS
        })
      }
    };
    audioVideo.realtimeSubscribeToAttendeeIdPresence(rosterUpdateCallback);

    const videoSendingCallback = (payload: RemoteMessage) => {
      const { type, message } = payload;
      if (type === SendVideoMessageType.LIST_AVAILABLE_VIDEOS) {
        console.log("Available videos changed");
        // Reset all video status
        const newRoster = {...rosterRef.current};
        Object.keys(newRoster).forEach(attendeeId => {
          newRoster[attendeeId].videoEnabled = false;
          newRoster[attendeeId].videoSending = false;
        });

        // Update video sending status based on the message
        message.forEach(attendee => {
          if (!newRoster[attendee.attendeeId]) {
            return;
          }
          newRoster[attendee.attendeeId].videoEnabled = true;
          newRoster[attendee.attendeeId].videoSending = attendee.sendingVideoState;
          newRoster[attendee.attendeeId].attendeeRole = attendee.attendeeRole;
        });

        setRoster(newRoster);
      }
    };
    videoSendingService.subscribeToMessageUpdate(videoSendingCallback);

    return () => {
      setRoster({});
      audioVideo.realtimeUnsubscribeToAttendeeIdPresence(rosterUpdateCallback);
      videoSendingService.unsubscribeFromMessageUpdate(videoSendingCallback);
    };
  }, [audioVideo, videoSendingService]);

  return (
    <RosterContext.Provider value={roster}>{children}</RosterContext.Provider>
  );
}

function useRoster(): RosterType {
  const roster = useContext(RosterContext);
  return roster;
}

export { RosterProvider, useRoster };
