// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';

import { useAudioVideo } from '../providers/AudioVideoProvider';

export default function useAttendeeRealtimeAudio(attendeeId: string) {
  const [volume, setVolume] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(false);
  const [signalStrength, setSignalStrength] = useState<number>(0);
  const audioVideo = useAudioVideo();

  useEffect(() => {
    if (!audioVideo) {
      return;
    }

    const callback = (
      _: string,
      volume: number | null,
      muted: boolean | null,
      signalStrength: number | null
    ): void => {
      if (volume !== null) {
        setVolume(Math.round(volume * 100));
      }
      if (muted !== null) {
        setMuted(muted);
      }
      if (signalStrength !== null) {
        setSignalStrength(Math.round(signalStrength * 100));
      }
    };
    audioVideo.realtimeSubscribeToVolumeIndicator(
      attendeeId,
      callback
    );

    return () => {
      audioVideo.realtimeUnsubscribeFromVolumeIndicator(attendeeId);
    };
  }, [audioVideo, attendeeId]);

  return {
    volume,
    muted,
    signalStrength,
  };
}
