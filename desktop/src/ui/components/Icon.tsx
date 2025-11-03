import React from 'react';
import { iconSizes } from '../../theme/tokens';

type Size = keyof typeof iconSizes;

type Props = {
  children: React.ReactNode; // emoji or icon char
  size?: Size;
  style?: React.CSSProperties;
};

export function Icon({ children, size = 'md', style }: Props) {
  return <span style={{ fontSize: iconSizes[size], lineHeight: 1, display: 'inline-block', ...style }}>{children}</span>;
}


