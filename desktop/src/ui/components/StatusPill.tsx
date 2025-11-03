import React from 'react';
import { spacing, fontSizes } from '../../theme/tokens';

type Props = { isOn: boolean };

export function StatusPill({ isOn }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: isOn ? '#10b981' : '#6b7280',
          boxShadow: isOn ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none',
        }}
      />
      <div style={{ fontSize: fontSizes.md, fontWeight: 500, color: '#374151' }}>
        {isOn ? '👁️ Monitorizando cambios' : '⏸️ Monitoreo pausado'}
      </div>
    </div>
  );
}


