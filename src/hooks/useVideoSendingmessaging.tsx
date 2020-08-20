import { useEffect } from 'react';

import { useMeetingStatus, MeetingStatus } from '../providers/MeetingStatusProvider';
import { useVideoSendingService } from '../providers/VideoSendingProvider';

const useVideoSendingMessaging = () => {
  const videoSendingService = useVideoSendingService();
  const { meetingStatus } = useMeetingStatus();
  
  useEffect(() => {
    if (meetingStatus !== MeetingStatus.Succeeded) {
      return;
    }

    const sendVideoMessaging = async () => {
      await videoSendingService?.sendVideoMessaging();
    };
    sendVideoMessaging();
  }, [meetingStatus]);
};

export default useVideoSendingMessaging;
