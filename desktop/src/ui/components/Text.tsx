import React from 'react';
import { fontSizes, fontWeights } from '../../theme/tokens';

type Size = keyof typeof fontSizes;
type Weight = keyof typeof fontWeights;

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2';
  size?: Size;
  weight?: Weight;
  color?: string;
};

export function Text({ as = 'span', size = 'md', weight = 'normal', color, style, children, ...rest }: Props) {
  const Comp = as as any;
  return (
    <Comp
      {...rest}
      style={{ fontSize: fontSizes[size], fontWeight: fontWeights[weight], margin: 0, ...(color ? { color } : {}), ...style }}
    >
      {children}
    </Comp>
  );
}


