// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useRef, useEffect } from 'react';
import {
  faVolumeMute,
  faVolumeUp,
} from '@fortawesome/free-solid-svg-icons'

import { useAudioVideo } from '../providers/AudioVideoProvider';
import IconButton from '../components/IconButton';
import ButtonGroup from '../components/ButtonGroup';

const AudioOutputControl: React.FC = () => {
  const audioVideo = useAudioVideo();
  const [isAudioOn, setIsAudioOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (!audioVideo) {
      return;
    }

    if (audioRef.current) {
      audioVideo.bindAudioElement(audioRef.current);
    }
    return () => {
      audioVideo.unbindAudioElement();
    };
  }, [audioRef, audioVideo]);

  const toggleAudio = (): void => {
    if (!audioRef.current) {
      return;
    }
    setIsAudioOn(!isAudioOn);
    if (isAudioOn) {
      audioVideo?.unbindAudioElement();
    } else {
      audioVideo?.bindAudioElement(audioRef.current);
    }
  }

  return (
    <>
      <ButtonGroup>
        <IconButton icon={isAudioOn ? faVolumeUp : faVolumeMute} onClick={toggleAudio} />
      </ButtonGroup>
      <audio ref={audioRef} style={{ display: 'none' }} />
    </>
  );
}

export default AudioOutputControl;
