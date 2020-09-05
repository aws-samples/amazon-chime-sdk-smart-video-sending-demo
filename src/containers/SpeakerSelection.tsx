// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from 'react';

import { useMeetingManager } from '../providers/MeetingProvider';
import { useAudioOutputs } from '../providers/DevicesProvider';
import DeviceInput from './DeviceInput';

const SpeakerSelection = () => {
  const meetingManager = useMeetingManager();
  const { devices } = useAudioOutputs();
  const [selectedOutput, setSelectedOutput] = useState('');

  useEffect(() => {
    if (!devices.length || selectedOutput) {
      return;
    }

    setSelectedOutput(devices[0].deviceId);
  }, [selectedOutput, devices]);

  async function selectAudioOutput(deviceId: string) {
    setSelectedOutput(deviceId);
    meetingManager.selectAudioOutputDevice(deviceId);
  }

  return (
    <div>
      <DeviceInput
        label="Speaker source"
        devices={devices}
        onChange={selectAudioOutput}
      />
    </div>
  );
};

export default SpeakerSelection;
