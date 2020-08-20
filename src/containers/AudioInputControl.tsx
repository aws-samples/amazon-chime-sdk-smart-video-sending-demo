import React, { useState, useEffect } from 'react';
import {
  faMicrophone,
  faMicrophoneSlash,
} from '@fortawesome/free-solid-svg-icons'

import { useAudioVideo } from '../providers/AudioVideoProvider';
import IconButton from '../components/IconButton';
import ButtonGroup from '../components/ButtonGroup';

const AudioInputControl: React.FC = () => {
  const audioVideo = useAudioVideo();
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const handler = (isMuted: boolean): void => {
      setMuted(isMuted);
    };
    audioVideo?.realtimeSubscribeToMuteAndUnmuteLocalAudio(handler);

    return () => {
      audioVideo?.realtimeUnsubscribeToMuteAndUnmuteLocalAudio(handler);
    };
  }, []);

  const toggleMicBtn = async (): Promise<void> => {
    if (muted) {
      audioVideo?.realtimeUnmuteLocalAudio();
    } else {
      audioVideo?.realtimeMuteLocalAudio();
    }
  };

  return (
    <ButtonGroup>
      <IconButton icon={muted ? faMicrophoneSlash : faMicrophone } onClick={toggleMicBtn} />
    </ButtonGroup>
  )
}

export default AudioInputControl;
