// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';

import { useRoster } from '../providers/RosterProvider';
import useActiveSpeakerDetector from '../hooks/useActiveSpeakers';
import RosterItem from '../components/RosterItem';

const StyledRoster = styled.div`
  border: 1px solid;
  display: inline-flex;
  flex-direction: column;
  position: absolute;
  right: 1rem;
  top: 3.5rem;
`;

const MeetingRoster = () => {
  const roster = useRoster();
  const activeSpeakers = useActiveSpeakerDetector();
  const attendees = Object.values(roster).map(item => {
    const { id, name } = item;
    return (
      <RosterItem
        key={id}
        id={id}
        name={name}
        isActiveSpeaker={activeSpeakers.includes(id)}
      />
    );
  });
  return <StyledRoster>{attendees}</StyledRoster>;
};

export default MeetingRoster;
