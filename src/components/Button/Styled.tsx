import styled from 'styled-components';

import { baseStyles, baseSpacing } from '../Base';
import { ButtonProps } from './';
import { hexTorgba } from '../../utils';

export const StyledButton = styled.button<ButtonProps>`
  border-radius: 0.25rem;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-color: transparent;
  transition: background-color 0.1s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #327aff;
  color: #ffffff;
  border: 0.03125rem solid #0042bb;
  box-shadow: 0 0.09375rem 0.0625rem 0 ${hexTorgba("#1b1c20", 0.15)};

  &:hover {
    cursor: pointer;
    background-color: #004ddb;
    border: 0.03125rem solid #0042bb;
    color: #ffffff;
  }

  &:focus {
    outline: none;
    background-color: #004ddb;
    border: 0.03125rem solid #0042bb;
    color: #ffffff;
  }

  &:active {
    background-color: #0042bb;
    border: 0.03125rem solid #0042bb;
    color: #ffffff;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 0.25rem;
  }

  ${baseSpacing}
  ${baseStyles}
`;
