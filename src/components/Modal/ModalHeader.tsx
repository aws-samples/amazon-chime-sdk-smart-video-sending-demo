// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';

import { useModalContext } from './ModalContext';
import { StyledModalHeader } from './Styled';

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  displayClose?: boolean;
  as?: any;
}

export const ModalHeader:FC<ModalHeaderProps> = ({
  as: Tag = "div",
  title,
}) => {

  const context = useModalContext();

  return (
    <StyledModalHeader>
      <Tag
        className="title"
        id={context.labelID}>
        {title}
      </Tag>
    </StyledModalHeader>
  );
};

export default ModalHeader;
