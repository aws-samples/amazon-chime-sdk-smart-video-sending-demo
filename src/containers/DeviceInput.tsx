import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';

import Select from '../components/Select';
import FormField from '../components/FormField';
import { DeviceType } from '../types';

const StyledInputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

interface Props {
  label: string;
  devices: DeviceType[];
  onChange: (deviceId: string) => void;
}

const DeviceInput: React.FC<Props> = ({ onChange, label, devices }) => {
  const [selectedDevice, setSelectedDevice] = useState('');

  const selectOptions = devices.map((device) => ({
    value: device.deviceId,
    label: device.label,
  }));

  useEffect(() => {
    if (!devices.length || selectedDevice) {
      return;
    }

    setSelectedDevice(devices[0].deviceId);
  }, [devices, selectedDevice]);

  async function selectDevice(e: ChangeEvent<HTMLSelectElement>) {
    const deviceId = e.target.value;
    setSelectedDevice(deviceId);
    onChange(deviceId);
  }

  return (
    <StyledInputGroup>
      <FormField
        field={Select}
        options={selectOptions}
        onChange={selectDevice}
        value={selectedDevice}
        label={label}
      />
    </StyledInputGroup>
  );
};

export default DeviceInput;
