import React, { useContext, useState, createContext } from 'react';

import MeetingManager from './MeetingManager';
import { AudioVideoProvider } from '../AudioVideoProvider';
import { DevicesProvider } from '../DevicesProvider';

export const MeetingContext = createContext<MeetingManager | null>(null);

const MeetingProvider: React.FC = ({ children }) => {
  const [meetingManager] = useState(() => new MeetingManager());

  return (
    <MeetingContext.Provider value={meetingManager}>
      <AudioVideoProvider>
        <DevicesProvider>
          {children}
        </DevicesProvider>
      </AudioVideoProvider>
    </MeetingContext.Provider>
  );
};

export const useMeetingManager = (): MeetingManager => {
  const meetingManager = useContext(MeetingContext);

  if (!meetingManager) {
    throw new Error('useMeetingManager must be used within MeetingProvider');
  }

  return meetingManager;
};

export default MeetingProvider;
