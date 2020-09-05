// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { useMeetingStatus, MeetingStatus } from '../providers/MeetingStatusProvider';
import { useVideoSendingService } from '../providers/VideoSendingProvider';
import { RemoteMessage, SendVideoMessageType } from '../types';
import { useLocalVideoContext } from '../providers/LocalVideoToggleProvider';

/* This handles meesage received from backend */
const useVideoSendingCommand = () => {
  const { meetingStatus } = useMeetingStatus();
  const videoSendingService = useVideoSendingService();
  const [canSendLocalVideo, setCanSendLocalVideo] = useState(false);
  const { setIsLocalVideoEnabled } = useLocalVideoContext();

  useEffect(() => {
    if (meetingStatus !== MeetingStatus.Succeeded) {
      return;
    }
    console.log('Setting up listeners for remote commands');
    const callback = async (message: RemoteMessage) => {
      const { type } = message;

      if (type === SendVideoMessageType.START_VIDEO) {
        console.log("Remote start share video");
        setCanSendLocalVideo(true);
        setIsLocalVideoEnabled('enabled');

      } else if (type === SendVideoMessageType.STOP_VIDEO) {
        console.log("Remote stop share video");
        setCanSendLocalVideo(false);
      }
    };

    videoSendingService?.subscribeToMessageUpdate(callback);
    return () => videoSendingService?.unsubscribeFromMessageUpdate(callback);
  }, [meetingStatus, videoSendingService]);

  return canSendLocalVideo;
}

export default useVideoSendingCommand;
