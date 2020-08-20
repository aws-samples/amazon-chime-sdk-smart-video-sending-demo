import React, { useEffect, CSSProperties } from 'react';
import { VideoTileState } from 'amazon-chime-sdk-js';

import { useAudioVideo } from '../providers/AudioVideoProvider';
import VideoTile from '../components/VideoTile';

interface Props {
  style?: CSSProperties;
  nameplate: string;
  videoEl: React.RefObject<HTMLVideoElement>;
}

export const LocalVideo: React.FC<Props> = ({ style, videoEl, nameplate }) =>{
  const audioVideo = useAudioVideo();

  useEffect(() => {
    if (!audioVideo) {
      return;
    }
  
    const videoTileDidUpdate = (tileState: VideoTileState) => {
      if (!tileState.boundAttendeeId || !tileState.localTile || !tileState.tileId || !videoEl.current) {
        return;
      }
      audioVideo.bindVideoElement(tileState.tileId, (videoEl.current as unknown as HTMLVideoElement))
    };

    audioVideo.addObserver({ videoTileDidUpdate });
  }, [audioVideo]);

  return <VideoTile videoEl={videoEl} nameplate={nameplate} style={style} />
};

export default LocalVideo;
