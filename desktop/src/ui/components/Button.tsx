import React from 'react';
import { buttonPrimary, buttonSecondary, buttonDanger, buttonGhostLight } from '../styles';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost-light';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ variant = 'primary', disabled, style, children, ...rest }: Props) {
  const base =
    variant === 'primary' ? buttonPrimary(disabled) :
    variant === 'secondary' ? buttonSecondary() :
    variant === 'danger' ? buttonDanger() :
    buttonGhostLight;
  return (
    <button {...rest} disabled={disabled} style={{ ...base, ...style }}>
      {children}
    </button>
  );
}


