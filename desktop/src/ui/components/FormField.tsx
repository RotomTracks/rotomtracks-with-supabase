import React from 'react';
import { inputBase, labelTitle } from '../forms/inputStyles';
import { spacing } from '../../theme/tokens';

type Props = {
  label: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  rightAdornment?: React.ReactNode;
};

export function FormField({ label, inputProps, rightAdornment }: Props) {
  return (
    <label style={{ display: 'grid', gap: spacing.sm }}>
      <div style={labelTitle}>{label}</div>
      <div style={{ position: 'relative' }}>
        <input
          {...inputProps}
          style={{ ...inputBase, ...(inputProps?.style || {}) }}
          onFocus={(e) => {
            inputProps?.onFocus?.(e);
            (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
          }}
          onBlur={(e) => {
            inputProps?.onBlur?.(e);
            (e.target as HTMLInputElement).style.borderColor = '#d1d5db';
          }}
        />
        {rightAdornment}
      </div>
    </label>
  );
}


