import React, {
  useContext,
  useState,
  createContext,
} from "react";
import {
  DefaultPromisedWebSocketFactory,
  ReconnectingPromisedWebSocket,
  FullJitterBackoff,
  DefaultDOMWebSocketFactory
} from "amazon-chime-sdk-js";

import { useMeetingManager } from './MeetingProvider';
import { getVideoSendingWssUrl } from '../utils';
import { Message, RemoteMessage } from '../types';

export const DEFAULT_WEB_SOCKET_TIMEOUT_MS = 10000;

class VideoSendingService {
  private static WEB_SOCKET_TIMEOUT_MS = DEFAULT_WEB_SOCKET_TIMEOUT_MS;
  private wsStabilizer: any;

  websocket: ReconnectingPromisedWebSocket | null = null;
  messageUpdateCallbacks: ((message: RemoteMessage) => void)[] = [];
  meetingId: string | null | undefined;
  attendeeId: string | null | undefined;
  attendeeRole: string | null | undefined;

  constructor() {
    const meetingManager = useMeetingManager();
    this.meetingId = meetingManager?.meetingId;
    this.attendeeId = meetingManager?.configuration?.credentials?.attendeeId;
    this.attendeeRole = meetingManager?.role;
  }

  private startWsStabilizer = () => {
    const seconds = 1000 * 60;
    const pingMessage = {
      message: "ping",
      data: JSON.stringify({type: "ping"})
    };

    this.wsStabilizer = setInterval(() => {
      try {
        this.websocket?.send(JSON.stringify(pingMessage));
      } catch (error) {
        console.error(`Error sending ping message: ${error}`);
        this.stopWsStabilizer();
      }
    }, seconds);
  };

  private stopWsStabilizer = () => {
    if (!this.wsStabilizer) {
      console.log('No active Websocket to stop!');
    }
    clearInterval(this.wsStabilizer);
  };

  sendVideoMessaging = async (): Promise<void> => {
    if (!this.attendeeId || !this.meetingId) {
      throw new Error("meetingId and attendeeId are required to send video messaging");
    }

    const baseUrl = getVideoSendingWssUrl();
    const url = `${baseUrl}?meetingId=${this.meetingId}&attendeeId=${this.attendeeId}&attendeeRole=${this.attendeeRole}`;
    this.websocket = new ReconnectingPromisedWebSocket(
      url,
      [],
      'arraybuffer',
      new DefaultPromisedWebSocketFactory(new DefaultDOMWebSocketFactory()),
      new FullJitterBackoff(1000, 0, 10000)
    );

    this.websocket.addEventListener('open', () => {
      // Initiate WS stabilizer
      this.startWsStabilizer();
    });

    await this.websocket.open(VideoSendingService.WEB_SOCKET_TIMEOUT_MS);

    this.websocket.addEventListener('message', (event: Event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        // Do not process ping messages.
        if (data.type === 'ping') return;

        this.publishMessageUpdate({
          type: data.type,
          message: data.message,
        });
      } catch (e) {
        console.log("Error:", e);
      }
    });

    window.addEventListener('beforeunload', () => {
      this.stopWsStabilizer();
      console.debug('Closing websocket.');
      this.websocket?.close(500, 1000, 'Unload').then(() => {
        console.debug('Closed websocket.');
      });
    });
  };

  sendMessage = (msg: Message) => {
    if (!this.websocket) {
      console.error("No websocket");
      return;
    }

    const message = {
      message: "sendmessage",
      data: JSON.stringify(msg)
    }
    try {
      this.websocket.send(JSON.stringify(message));
    } catch (e) {
      console.error(`Error sending message: ${e}`);
    }
  }

  subscribeToMessageUpdate = (callback: (message: RemoteMessage) => void) => {
    this.messageUpdateCallbacks.push(callback);
  };

  unsubscribeFromMessageUpdate = (callback: (message: RemoteMessage) => void) => {
    const index = this.messageUpdateCallbacks.indexOf(callback);
    if (index !== -1) {
      this.messageUpdateCallbacks.splice(index, 1);
    }
  };

  private publishMessageUpdate = (message: RemoteMessage) => {
    for (let i = 0; i < this.messageUpdateCallbacks.length; i += 1) {
      const callback = this.messageUpdateCallbacks[i];
      callback(message);
    }
  };
}

const VideoSendingServiceContext = createContext<VideoSendingService | null>(null);

function useVideoSendingService() {
  const context = useContext(VideoSendingServiceContext);
  if (context === undefined) {
    throw new Error(
      'useVideoSendingService must be used within a VideoSendingProvider'
    );
  }
  return context;
}

const VideoSendingProvider: React.FC = ({ children }) => {
  const [videoSendingService] = useState<VideoSendingService>(() => new VideoSendingService());

  return (
    <VideoSendingServiceContext.Provider value={videoSendingService}>
      {children}
    </VideoSendingServiceContext.Provider>
  )
}

export { VideoSendingProvider, useVideoSendingService };
