// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useMemo,
} from 'react';
import { DeviceChangeObserver } from 'amazon-chime-sdk-js';

import { useAudioVideo } from '../AudioVideoProvider';
import { useMeetingManager } from '../MeetingProvider';
import { DeviceTypeContext } from '../../types';

const Context = createContext<DeviceTypeContext | null>(null);

const AudioInputProvider: React.FC = ({ children }) => {
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioInputDevice, setSelectedAudioInputDevice] = useState(
    meetingManager.selectedAudioInputDevice
  );

  useEffect(() => {
    const callback = (updatedAudioInputDevice: string | null): void => {
      setSelectedAudioInputDevice(updatedAudioInputDevice);
    };

    meetingManager.subscribeToSelectedAudioInputDeviceChange(callback);

    return (): void => {
      meetingManager.unsubscribeFromSelectedAudioInputDeviceChange(callback);
    };
  }, [meetingManager]);

  useEffect(() => {
    let isMounted = true;

    const observer: DeviceChangeObserver = {
      audioInputsChanged: (newAudioInputs: MediaDeviceInfo[]) => {
        console.log('AudioInputProvider - audio inputs updated');
        setAudioInputs(newAudioInputs);
      },
    };

    async function initAudioInput() {
      if (!audioVideo) {
        return;
      }

      const devices = await audioVideo.listAudioInputDevices();

      if (isMounted) {
        setAudioInputs(devices);
        audioVideo.addDeviceChangeObserver(observer);
      }
    }

    initAudioInput();

    return () => {
      isMounted = false;
      audioVideo?.removeDeviceChangeObserver(observer);
    };
  }, [audioVideo]);

  const contextValue: DeviceTypeContext = useMemo(
    () => ({
      devices: audioInputs,
      selectedDevice: selectedAudioInputDevice,
    }),
    [audioInputs, selectedAudioInputDevice]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

const useAudioInputs = (): DeviceTypeContext => {
  const context = useContext(Context);

  if (!context) {
    throw new Error('useAudioInputs must be used within AudioInputProvider');
  }

  let { devices } = context;
  const { selectedDevice } = context;

  return { devices, selectedDevice };
};

export { AudioInputProvider, useAudioInputs };
