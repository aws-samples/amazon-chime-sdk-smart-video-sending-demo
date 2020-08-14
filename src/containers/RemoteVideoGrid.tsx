import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { VideoTileState } from 'amazon-chime-sdk-js';

import { useAudioVideo } from '../providers/AudioVideoProvider';
import { useRoster } from '../providers/RosterProvider';
import { useMeetingManager } from '../providers/MeetingProvider';
import VideoGrid from '../components/VideoGrid';
import RemoteVideo from '../components/RemoteVideo';
import { MAX_REMOTE_VIDEOS } from '../constants';

const RemoteVideoGrid: React.FC = () => {
  const roster = useRoster();
  const meetingManager = useMeetingManager();
  const attendeeRole = meetingManager?.role;
  const tiles: { [index: number]: number } = {};
  const videoElements: HTMLVideoElement[] = []; // an array of 16 HTMLVideoElement objects
  const [visibleIndices, setVisibleIndices] = useState<{
    [index: string]: { boundAttendeeId: string };
  }>({});
  const audioVideo = useAudioVideo();

  const acquireTileIndex = (tileId: number): number => {
    for (let index = 0; index < MAX_REMOTE_VIDEOS; index++) {
      if (tiles[index] === tileId) {
        return index;
      }
    }
    for (let index = 0; index < MAX_REMOTE_VIDEOS; index++) {
      if (!(index in tiles)) {
        tiles[index] = tileId;
        return index;
      }
    }
    throw new Error('no tiles are available');
  };

  const releaseTileIndex = (tileId: number): number => {
    for (let index = 0; index < MAX_REMOTE_VIDEOS; index++) {
      if (tiles[index] === tileId) {
        delete tiles[index];
        return index;
      }
    }
    return MAX_REMOTE_VIDEOS;
  };

  useEffect(() => {
    if (!audioVideo) {
      return;
    }
    const videoTileDidUpdate = (tileState: VideoTileState) => {
      const { boundAttendeeId, localTile, isContent, tileId, boundExternalUserId } = tileState;
      if (!boundAttendeeId || localTile || isContent || !tileId) {
        return;
      }
      // student will ignore video from other students
      if (attendeeRole === 'student' && boundExternalUserId?.startsWith('student')) {
        audioVideo.pauseVideoTile(tileId);
        return;
      }
      const index = acquireTileIndex(tileId);
      audioVideo.bindVideoElement(tileId, videoElements[index]);
      setVisibleIndices((previousVisibleIndices) => ({
        ...previousVisibleIndices,
        [index]: { boundAttendeeId: boundAttendeeId },
      }));
    };

    const videoTileWasRemoved = (tileId: number) => {
      const index = releaseTileIndex(tileId);
      setVisibleIndices((previousVisibleIndices) => ({
        ...previousVisibleIndices,
        [index]: null,
      }));
    };

    const observers = { videoTileDidUpdate, videoTileWasRemoved };
    audioVideo.addObserver(observers);

    return () => {
      audioVideo.removeObserver(observers);
    };
  }, [audioVideo]);

  const numberOfVisibleIndices = Object.keys(visibleIndices).reduce<number>(
    (result: number, key: string) => result + (visibleIndices[key] ? 1 : 0),
    0
  );

  return (
    <div>
      <VideoGrid size={numberOfVisibleIndices}>
        {Array.from(Array(MAX_REMOTE_VIDEOS).keys()).map((key, index) => {
          const visibleIndex = visibleIndices && visibleIndices[index];
          let rosterAttendee;
          if (visibleIndex && roster) {
            rosterAttendee = roster[visibleIndex.boundAttendeeId];
          }
          return (
            <RemoteVideo
              key={key}
              enabled={!!visibleIndex}
              attendeeName={rosterAttendee?.name}
              videoEleRef={useCallback((element: HTMLVideoElement | null) => {
                if (element) {
                  videoElements[index] = element;
                }
              }, [])}
            />
          )
        })}
      </VideoGrid>
    </div>
  );
}

export default RemoteVideoGrid;
