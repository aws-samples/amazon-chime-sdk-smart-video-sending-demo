// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';

import useAttendeeRealtimeAudio from '../hooks/useAttendeeRealtimeAudio';

const StyledRosterItem = styled.div`
  display: flex;

  .attendee-name {
    flex-grow: 1;
  }

  .active-speaker-status {
    width: 3rem;
  }

  p {
    margin: 1rem;
  }
`;

type Props = {
  id: string;
  name: string;
  isActiveSpeaker: boolean;
};

const RosterItem = (props: Props) => {
  const { id, name, isActiveSpeaker } = props;
  const { muted } = useAttendeeRealtimeAudio(id);

  return (
    <StyledRosterItem>
      <p className="attendee-name">{name}</p>
      <p>{muted ? 'muted' : 'not muted'}</p>
      <p className="active-speaker-status">
        {isActiveSpeaker ? 'speaking' : ''}
      </p>
    </StyledRosterItem>
  );
};

export default RosterItem;
