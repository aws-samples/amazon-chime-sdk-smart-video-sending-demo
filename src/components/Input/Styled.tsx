// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

import { hexTorgba } from '../../utils';

export const StyledInput = styled.input`
  align-items: center;
  display: flex;
  letter-spacing: -0.005625rem;
  transition: box-shadow .05s ease-in;
  background-color: #ffffff;
  border: 0.03125rem solid #d4d5d8;
  border-radius: 0.25rem;
  box-shadow: 0 0.0625rem 0.0625rem 0 ${hexTorgba("#000000", 0.1)};
  color: #3f4149;
  font-size: 0.875rem;
  line-height: 1.43;

  &::placeholder {
    color: #989da5;
  }

  &:focus,
  &[aria-invalid="true"]:focus {
    border:solid 0.03125rem #5d96ff;
    box-shadow: 0 0 0 0.125rem #88b2ff;
    outline: none;
  }

  &[aria-invalid="true"] {
    border: 0.03125rem solid #9E3319;
    box-shadow: 0 0 0 0.125rem #FF927C;
  }
`;
