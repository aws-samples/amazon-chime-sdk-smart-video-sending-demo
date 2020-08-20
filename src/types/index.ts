export type FormattedDeviceType = {
  deviceId: string;
  label: string;
};

export type DeviceType = MediaDeviceInfo | FormattedDeviceType;

export type SelectedDeviceType = string | null;

export type DeviceTypeContext = {
  devices: DeviceType[];
  selectedDevice: SelectedDeviceType;
};

export type SendVideoMessagePayload = {
  meetingId: string;
  attendeeId: string;
}

export enum SendVideoMessageType {
  START_VIDEO = 'start-video',
  STOP_VIDEO = 'stop-video',
}

export type Message = {
  type: SendVideoMessageType;
  payload: SendVideoMessagePayload;
}