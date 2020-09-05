// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { HTMLAttributes } from 'react';

import { StyledVideoTile } from './Styled';
import { BaseProps } from '../Base';

export interface VideoTileProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'css'>,
    BaseProps {
  nameplate: string;
  videoEl: React.RefObject<HTMLVideoElement>;
}

export const VideoTile: React.SFC<VideoTileProps> = ({
  tag,
  className,
  nameplate,
  videoEl,
  ...rest
}) => {

  return (
    <StyledVideoTile
      as={tag}
      className={className || ''}
      data-testid="video-tile"
      {...rest}
    >
      <video ref={videoEl} className="video" />
      <header className="nameplate">
        <div>
          <p className="text">{nameplate}</p>
        </div>
      </header>
    </StyledVideoTile>
  );
};

export default VideoTile;
