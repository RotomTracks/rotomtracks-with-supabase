import React from 'react';
import { card } from '../styles';
import { h2, subtitle as subtitleStyle } from '../typography';
import { borderWidths } from '../../theme/tokens';

type Props = {
  title?: string;
  subtitle?: string;
  borderColor?: string;
  padding?: number;
  children: React.ReactNode;
};

export function SectionCard({ title, subtitle, borderColor, padding, children }: Props) {
  return (
    <div style={{ ...card, ...(padding ? { padding } : {}), ...(borderColor ? { border: `${borderWidths.sm}px solid ${borderColor}` } : {}) }}>
      {title && (
        <h2 style={{ ...h2, color: '#111827', marginBottom: subtitle ? 4 : 8 }}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p style={{ ...subtitleStyle, marginTop: 0, marginBottom: 20 }}>{subtitle}</p>
      )}
      {children}
    </div>
  );
}


