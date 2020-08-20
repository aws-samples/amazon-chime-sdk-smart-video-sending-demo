import styled, { keyframes } from 'styled-components';

import { ModalProps } from './';
import { hexTorgba } from '../../utils';

const fadeAnimation = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const slideDownAndScaleUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(4rem) scale(0.4);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`

const ModalWidths = {
  'medium': '35rem',
  'large': '50rem',
  'fullscreen': '98vw',
};

const ModalHeights = {
  'medium': '94vh',
  'large': '94vh',
  'fullscreen': '96vh',
};

export const StyledModal = styled.div<ModalProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${hexTorgba('#7d818b', 0.9)};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  overflow-x: hidden;
  animation: ${fadeAnimation} .25s ease 0s forwards;
  will-change: opacity;

  > section {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 0.25rem;
    color: #3f4149;
    background-color: #ffffff;
    width: ${props => ModalWidths[props.size || 'medium']};
    box-shadow: 0 0.75rem 1.875rem 0 ${hexTorgba('#000000', 0.15)};
    max-width: ${props => props.size === 'fullscreen' ? ModalWidths[props.size] : '90vw'};
    height: ${props => props.size === 'fullscreen' ? ModalHeights[props.size] : 'auto'};
    max-height: ${props => ModalHeights[props.size || 'medium']};
    will-change: transform, opacity;
    animation: ${slideDownAndScaleUp} .15s ease 0s forwards;

    @media only screen and (max-height: 25rem) {
      position: absolute;
      top: 2rem;
      height: auto;
      max-height: none;
    }
  }
`;

export const StyledModalHeader = styled.header`
  padding: 1rem 1.5rem;

  .closeButton {
    position: absolute;
    right: 1.55rem;
    top: 1rem;
  }

  .title {
    padding-right: 2rem;
    margin: 0;
    font-size: 1.5625rem;
    font-weight: normal;
  }
`;

export const StyledModalBody = styled.div`
  padding: 0 1.5rem;
  flex-grow: 1;
  overflow-y: auto;
`;

export const StyledModalButtonGroup = styled.footer`
  padding: 1.5rem;
  border-top: 1px solid #d4d5d8;
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;

  div:first-child {
    display: flex;
    flex-direction: row-reverse;
  }

  button + button {
    margin: 0 0.5rem 0 0;
  }

  @media(max-width: 35rem) {
    flex-direction: column;

    button {
      width: 100%;
    }

    div:first-child {
      display: flex;
      flex-direction: column;
    }

    button + button,
    div + div {
      margin: 0.5rem 0 0;
    }
  }
`;
