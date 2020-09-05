// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import styled, { css } from 'styled-components';

import { RemoteVideoProps } from './';
import { baseStyles, baseSpacing } from '../Base';

const ellipsis = css`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const StyledRemoteVideo = styled.div<RemoteVideoProps>`
  width: 100%;
  position: relative;
  display: ${props => props.enabled? "inline-block" : "none"};
  vertical-align: top;
  top: 12rem;

  &:before {
    content: '';
    display: block;
    padding-top: 56.25%;
  }

  &:after {
    content: '';
    position: absolute;
    box-shadow: 0 1rem 2.5rem 0 #000000;
    opacity: 0;
    transition: opacity 0.2s ease-in;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  &:hover:after {
    opacity: 0.3;
  }

  video {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }

  .nameplate {
    backdrop-filter: blur(20px);
    background-color: rgba(46, 47, 52, 0.85);
    border-radius: 0.25rem;
    bottom: 0.5rem;
    color: #ffffff;
    left: 0.5rem;
    max-width: calc(100% - 2rem);
    padding: 0.5rem;
    position: absolute;

    div {
      ${ellipsis};
      display: flex;
      align-items: center;
    }

    .text {
      font-size: 0.875rem;
      ${ellipsis};
      margin: 0;
    }
  }

  ${baseSpacing}
  ${baseStyles}
`;
