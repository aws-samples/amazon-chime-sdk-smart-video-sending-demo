import React from 'react';
import styled from 'styled-components';

import CameraSelection from './CameraSelection';
import MicSelection from './MicSelection';
import SpeakerSelection from './SpeakerSelection';

const StyledAudioGroup = styled.div`
  padding: 0 3rem 0 0;
  border-right: 0.125rem solid #e6e6e6;

  @media (max-width: 900px) {
    padding: 2rem 0 2rem 0;
    border-right: unset;
  }
`;

const StyledVideoGroup = styled.div`
  padding: 0 0 0 3rem;

  @media (max-width: 900px) {
    padding: 0;
  }
`;

const StyledWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 65rem;
  height: auto;

  > * {
    flex-basis: auto;
  }

  @media (min-width: 900px) {
    flex-direction: row;
    padding: 2.5rem 0 6rem 0;

    > * {
      flex-basis: 50%;
    }

    @media (max-height: 800px) {
      padding: 2rem 0 2rem;
    }
  }
`;

const DeviceSelection = () => (
  <StyledWrapper>
    <StyledAudioGroup>
      <MicSelection />
      <SpeakerSelection />
    </StyledAudioGroup>
    <StyledVideoGroup>
      <CameraSelection />
    </StyledVideoGroup>
  </StyledWrapper>
);

export default DeviceSelection;
