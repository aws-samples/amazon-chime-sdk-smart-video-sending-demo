import { useState, useEffect } from 'react';
import { DefaultActiveSpeakerPolicy } from 'amazon-chime-sdk-js';

import { useAudioVideo } from '../providers/AudioVideoProvider';

export default function useActiveSpeakers() {
  const [activeSpeakerIds, setActiveSpeakerIds] = useState<string[]>([]);
  const audioVideo = useAudioVideo();
  
  useEffect(() => {
    if (!audioVideo) {
      return;
    }
    const callback = (activeSpeakers: string[]): void => {
      setActiveSpeakerIds(activeSpeakers);
    };

    audioVideo.subscribeToActiveSpeakerDetector(
      new DefaultActiveSpeakerPolicy(),
      callback
    );

    return () => {
      audioVideo.unsubscribeFromActiveSpeakerDetector(
        callback
      );
    };
  }, [audioVideo]);

  return activeSpeakerIds;
}
