// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useRef, useEffect } from 'react';
import {
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons'

import { useMeetingManager } from '../providers/MeetingProvider';
import { useAudioVideo } from '../providers/AudioVideoProvider';
import { useLocalVideoContext } from '../providers/LocalVideoToggleProvider';
import useVideoSendingCommand from '../hooks/useVideoSendingCommand';
import IconButton from '../components/IconButton';
import ButtonGroup from '../components/ButtonGroup';
import LocalVideo from './LocalVideo';

const VideoInputControl: React.FC = () => {
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const { isLocalVideoEnabled, toggleVideo, nameplate, setNameplate } = useLocalVideoContext();
  const videoEl = useRef<HTMLVideoElement>(null);
  const canSendLocalVideo = useVideoSendingCommand();
  const attendeeName = meetingManager.attendeeName!;

  useEffect(() => {
    if (!audioVideo) {
      return;
    }
    const sendLocalVideo = async () => {
      await audioVideo.chooseVideoInputDevice(meetingManager.selectedVideoInputDevice);
      audioVideo.startLocalVideoTile();
      setNameplate(attendeeName);
    }

    const sendLocalVideoPreview = async () => {
      await audioVideo.chooseVideoInputDevice(meetingManager.selectedVideoInputDevice);
      if (videoEl.current) {
        audioVideo.startVideoPreviewForVideoInput(videoEl.current);
        setNameplate(`${attendeeName} - preview`);
      }else {
        throw new Error('No video preview element to show preview!');
      }
    }

    if (canSendLocalVideo && isLocalVideoEnabled !== 'disabled') {
      if (videoEl.current) {
        audioVideo.stopVideoPreviewForVideoInput(videoEl.current);
      }
      sendLocalVideo();
    }
    if (!canSendLocalVideo && isLocalVideoEnabled === 'enabled') {
      audioVideo.stopLocalVideoTile();
      sendLocalVideoPreview();
    }
  }, [audioVideo, canSendLocalVideo]);

  return (
    <>
      <ButtonGroup>
        <IconButton
          icon={isLocalVideoEnabled === 'disabled' ? faVideoSlash : faVideo}
          onClick={() => toggleVideo(videoEl.current)} />
      </ButtonGroup>
      <LocalVideo
        nameplate={nameplate}
        videoEl={videoEl}
        style={{ width: "20rem", position: "absolute", top: "3.5rem", background: "#1c1c1c" }}
      />
    </>
  );
}

export default VideoInputControl;
