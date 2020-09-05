// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const getVideoSendingWssUrl = () => {
  return 'wss://1ft9bu028h.execute-api.us-east-1.amazonaws.com/Prod';
};

const isValidCSSHex = (hex: string) => {
  // matches 6 digit characters prefixed with a '#'.
  return /^#[0-9A-F]{6}$/i.test(hex);
}

export const hexTorgba =(hex: string, alpha: number = 1) => {
  if (!isValidCSSHex(hex)) {
    return false;
  }

  const [r, g, b]: any = hex.match(/\w\w/g)?.map(h => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha || 1})`;
};
