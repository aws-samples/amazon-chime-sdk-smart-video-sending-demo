// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ChangeEvent, forwardRef, Ref, InputHTMLAttributes, } from 'react';
import styled from "styled-components";

import { hexTorgba } from '../utils';

const StyledSelectInput = styled.select`
  background-color: #ffffff;
  border: 0.03125rem solid #d4d5d8;
  border-radius: 0.25rem;
  box-shadow: 0 0.0625rem 0.0625rem 0 ${hexTorgba("#000000", 0.1)};
  color: #3f4149;
  font-size: 0.875rem;
  line-height: 1.43;
  height: 2rem;
  letter-spacing: -0.005625rem;
  padding: 0.375rem 0.5rem;
  transition: box-shadow .05s ease-in;

  &:focus,
  &[aria-invalid="true"]:focus {
    border: solid 0.03125rem #5d96ff;
    box-shadow: 0 0 0 0.125rem #88b2ff;
    outline: none;
  }

  &[aria-invalid="true"] {
    border: 0.03125rem solid #9E3319;
    box-shadow: 0 0 0 0.125rem #FF927C;
  }
`;

export type SelectOptions = {
  value: string | number;
  label: string;
}

export interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  options: SelectOptions[];
  onChange(event: ChangeEvent): void;
  value: string;
}

const renderOptions = (options: SelectOptions[]) => {
  return (
    options.map(({ value, label }) => <option key={value} value={value}>{label}</option>)
  );
}

export const Select = forwardRef((props: SelectProps, ref: Ref<HTMLSelectElement>) => (
  <StyledSelectInput
    className="Select"
    data-testid='select'
    ref={ref}
    {...props}
  >
    {renderOptions(props.options)}
  </StyledSelectInput>
));


Select.displayName = 'Select';

export default Select;
