import React from 'react';

import { useMeetingManager } from '../providers/MeetingProvider';
import { useAudioInputs } from '../providers/DevicesProvider/AudioInputProvider';
import DeviceInput from './DeviceInput';

const MicSelection = () => {
  const meetingManager = useMeetingManager();
  const { devices } = useAudioInputs();

  async function selectAudioInput(deviceId: string) {
    meetingManager.selectAudioInputDevice(deviceId);
  }

  return (
    <div>
      <h2>
        Audio
      </h2>
      <DeviceInput
        label="Microphone source"
        onChange={selectAudioInput}
        devices={devices}
      />
    </div>
  );
};

export default MicSelection;
