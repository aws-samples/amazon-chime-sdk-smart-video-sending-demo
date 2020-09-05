// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';

import { useMeetingManager } from './MeetingProvider';
import { useAudioVideo } from './AudioVideoProvider';
import { useVideoSendingService } from './VideoSendingProvider';
import { SendVideoMessageType } from '../types';

type LocalVideoState = 'enabled' | 'disabled' | 'pending';

type LocalVideoContextType = {
  isLocalVideoEnabled: LocalVideoState;
  setIsLocalVideoEnabled: React.Dispatch<React.SetStateAction<LocalVideoState>>;
  nameplate: string;
  setNameplate: React.Dispatch<React.SetStateAction<string>>;
  toggleVideo: (ele: HTMLVideoElement | null) => Promise<void>;
};

const LocalVideoContext = createContext<LocalVideoContextType | null>(null);

const LocalVideoToggleProvider: React.FC = ({ children }) => {
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const [isLocalVideoEnabled, setIsLocalVideoEnabled] = useState<LocalVideoState>('disabled');
  const videoSendingService = useVideoSendingService();
  const selfAttendeeId = meetingManager?.configuration?.credentials?.attendeeId!;
  const [nameplate, setNameplate] = useState("");
  const meetingId = meetingManager?.meetingId!;
  const attendeeName = meetingManager.attendeeName!;

  const toggleVideo = useCallback(async (previewEle: HTMLVideoElement | null): Promise<void> => {
    if (isLocalVideoEnabled === 'enabled' || !meetingManager.selectedVideoInputDevice) {
      audioVideo?.stopLocalVideoTile();
      previewEle && audioVideo?.stopVideoPreviewForVideoInput(previewEle);
      setIsLocalVideoEnabled('disabled');
      setNameplate("");

      const payload = { meetingId: meetingId, attendeeId: selfAttendeeId };
      videoSendingService?.sendMessage({
        type: SendVideoMessageType.STOP_VIDEO,
        payload: payload
      });

    } else if (isLocalVideoEnabled === 'disabled') {
      await audioVideo?.chooseVideoInputDevice(meetingManager?.selectedVideoInputDevice);
      if (previewEle) {
        console.log("Start preview before getting remote command");
        audioVideo?.startVideoPreviewForVideoInput(previewEle);
        setNameplate(`${attendeeName} - preview`)
        setIsLocalVideoEnabled('pending');

        const payload = { meetingId: meetingId, attendeeId: selfAttendeeId };
        videoSendingService?.sendMessage({
          type: SendVideoMessageType.START_VIDEO,
          payload: payload
        });
      } else {
        throw new Error('No video preview element');
      }
    }
  }, [audioVideo, isLocalVideoEnabled, meetingManager.selectedVideoInputDevice]);

  const value = useMemo(() => ({ isLocalVideoEnabled, setIsLocalVideoEnabled, nameplate, setNameplate, toggleVideo }), [
    isLocalVideoEnabled, setIsLocalVideoEnabled, nameplate, setNameplate, toggleVideo]);
  
  return <LocalVideoContext.Provider value={value}>{children}</LocalVideoContext.Provider>;
};

const useLocalVideoContext = (): LocalVideoContextType => {
  const context = useContext(LocalVideoContext);
  if (!context) {
    throw new Error(
      'useLocalVideoContext must be used within a LocalVideoToggleProvider'
    );
  }
  return context;
}

export { LocalVideoToggleProvider, useLocalVideoContext };
