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
  isSendingVideo?: boolean;
}

export enum SendVideoMessageType {
  START_VIDEO = 'start-video',
  STOP_VIDEO = 'stop-video',
  TOGGLE_STUDENT_VIDEO = 'toggle-student-video',
  LIST_AVAILABLE_VIDEOS = 'list-available-videos',
}

export type Message = {
  type: SendVideoMessageType;
  payload?: SendVideoMessagePayload;
}

export type RemoteMessage = {
  type: SendVideoMessageType;
  message: any;
}
