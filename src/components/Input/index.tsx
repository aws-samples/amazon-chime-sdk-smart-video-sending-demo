// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ChangeEvent, forwardRef, Ref } from 'react';
import { StyledInput } from './Styled';

export type Size = 'sm' | 'md';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  onChange(event: ChangeEvent): void;
  sizing?: Size;
  value: string;
}

export const Input = forwardRef((props: InputProps, ref: Ref<HTMLInputElement>) => {
  const { className, sizing, type, onChange,  ...rest } = props;

  return (
    <StyledInput
      {...rest}
      type={type || "text"}
      ref={ref}
      className="Input"
      onChange={(e: ChangeEvent) => onChange(e)}
      data-testid='input'
    />
  );
});

Input.displayName = 'Input';

export default Input;
