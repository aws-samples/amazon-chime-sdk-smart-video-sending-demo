import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useMemo
} from 'react';
import { DeviceChangeObserver } from 'amazon-chime-sdk-js';

import { useAudioVideo } from '../AudioVideoProvider';
import { useMeetingManager } from '../MeetingProvider';
import { DeviceTypeContext } from '../../types';

export type LocalVideoToggleContextType = {
  isVideoEnabled: boolean;
  toggleVideo: () => Promise<void>;
};

const Context = createContext<DeviceTypeContext | null>(null);

const VideoInputProvider: React.FC = ({ children }) => {
  const audioVideo = useAudioVideo();
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const meetingManager = useMeetingManager();
  const [selectedVideoInputDevice, setSelectedVideoInputDevice] = useState(
    meetingManager.selectedVideoInputDevice
  );

  useEffect(() => {
    const callback = (updatedVideoInputDevice: string | null): void => {
      setSelectedVideoInputDevice(updatedVideoInputDevice);
    };

    meetingManager.subscribeToSelectedVideoInputDeviceChange(callback);

    return (): void => {
      meetingManager.unsubscribeFromSelectedVideoInputDeviceChange(callback);
    };
  }, [meetingManager]);

  useEffect(() => {
    let isMounted = true;

    const observer: DeviceChangeObserver = {
      videoInputsChanged: (newvideoInputs: MediaDeviceInfo[]) => {
        setVideoInputs(newvideoInputs);
      }
    };

    async function initVideoInput() {
      if (!audioVideo) {
        return;
      }

      const devices = await audioVideo.listVideoInputDevices();

      if (isMounted) {
        setVideoInputs(devices);
        audioVideo.addDeviceChangeObserver(observer);
      }
    }

    initVideoInput();

    return () => {
      isMounted = false;
      audioVideo?.removeDeviceChangeObserver(observer);
    };
  }, [audioVideo]);

  const contextValue: DeviceTypeContext = useMemo(
    () => ({
      devices: videoInputs,
      selectedDevice: selectedVideoInputDevice
    }),
    [videoInputs, selectedVideoInputDevice]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

const useVideoInputs = (): DeviceTypeContext => {
  const context = useContext(Context);

  if (!context) {
    throw new Error('useVideoInputs must be used within VideoInputProvider');
  }
  let { devices } = context;
  const { selectedDevice } = context;

  return { devices, selectedDevice };
};

export { VideoInputProvider, useVideoInputs };
