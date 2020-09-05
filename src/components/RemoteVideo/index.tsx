// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { HTMLAttributes } from 'react';

import { StyledRemoteVideo } from './Styled';
import { BaseProps } from '../Base';

export interface RemoteVideoProps extends Omit<HTMLAttributes<HTMLDivElement>, 'css'>, BaseProps {
  enabled: boolean
  attendeeName?: string;
  videoEleRef: ((instance: HTMLVideoElement | null) => void);
}

const RemoteVideo: React.FC<RemoteVideoProps> = ({ tag,
  className, videoEleRef, attendeeName, ...rest }) => {

  return (
    <StyledRemoteVideo
      as={tag}
      className={className || ''}
      {...rest}
    >
      <video ref={videoEleRef} />
      {/* {attendeeName && <span>{attendeeName}</span>} */}
      <header className="nameplate">
        <div>
          <p className="text">{attendeeName}</p>
        </div>
      </header>
    </StyledRemoteVideo>
  );
}

export default RemoteVideo;
