// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

import { useMeetingManager } from '../providers/MeetingProvider';
import { useAudioVideo } from '../providers/AudioVideoProvider';
import { useVideoInputs } from '../providers/DevicesProvider';
import { Label } from '../components/Label';
import DeviceInput from './DeviceInput';

const StyledVideoPreview = styled.video`
  width: 100%;
  height: auto;
  border-radius: 0.1875rem;
  background-color: #1c1c1c;
`;

const CameraSelection = () => {
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const { devices } = useVideoInputs();
  const videoEl = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!audioVideo) {
      return;
    }

    videoEl.current &&
      audioVideo.startVideoPreviewForVideoInput(videoEl.current);

    return () => {
      if (videoEl.current) {
        audioVideo.stopVideoPreviewForVideoInput(videoEl.current);
        audioVideo.stopVideoInput();
      }
    };
  }, [audioVideo]);

  async function selectVideoInput(deviceId: string) {
    meetingManager.selectVideoInputDevice(deviceId);
  }

  return (
    <div>
      <h2>Video</h2>
      <DeviceInput
        label="Camera source"
        onChange={selectVideoInput}
        devices={devices}
      />
      <Label style={{ display: 'block', marginBottom: '.5rem' }}>
        Video preview
      </Label>
      <StyledVideoPreview ref={videoEl} />
    </div>
  );
};

export default CameraSelection;
