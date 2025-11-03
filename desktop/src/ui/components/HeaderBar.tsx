import React from 'react';
import { buttonGhostLight, buttonDanger, headerContainer } from '../styles';
import { colors } from '../../theme/colors';
import { h1, subtitle as subtitleStyle } from '../typography';
import { iconSizes } from '../../theme/tokens';
import { spacing } from '../../theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  showDebug?: boolean;
  onDebug?: () => void;
  onLogout: () => void;
};

export function HeaderBar({ title, subtitle, showDebug, onDebug, onLogout }: Props) {
  return (
    <div style={headerContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ ...h1, color: 'white', marginBottom: 4 }}>{title}</h1>
          {subtitle && (
            <p style={{ ...subtitleStyle, color: 'rgba(255,255,255,0.9)' }}>{subtitle}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          {showDebug && (
            <button
              onClick={onDebug}
              style={buttonGhostLight}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            >
              🔍 Debug
            </button>
          )}
          <button
            onClick={onLogout}
            style={buttonDanger()}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.dangerHover;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.danger;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: iconSizes.md }}>↩️</span>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}


