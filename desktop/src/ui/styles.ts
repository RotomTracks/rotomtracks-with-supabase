import { colors } from '../theme/colors';
import { spacing, radii, shadows, fonts, borderWidths } from '../theme/tokens';
import { muted } from './typography';

export const pageGradient = {
  height: '100vh',
  width: '100vw',
  background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
  fontFamily: fonts.system,
  position: 'fixed' as const,
  top: 0,
  left: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  overflow: 'hidden',
};

export const headerContainer = {
  padding: `${spacing.xl}px ${spacing.xxl}px`,
  flexShrink: 0,
};

export const card = {
  background: 'white',
  borderRadius: radii.xxl,
  padding: spacing.xxl,
  boxShadow: shadows.sm,
};

export const cardCompact = { ...card, padding: spacing.lg } as const;
export const cardSpacious = { ...card, padding: spacing.xxxl } as const;

// Layout helpers
export const containerPadding = {
  padding: 24,
  fontFamily: fonts.system,
} as const;

export const contentContainer = {
  maxWidth: 1200,
  margin: '0 auto',
} as const;

export const textCenter = { textAlign: 'center' } as const;
export const rowBetweenCenter = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as const;
export const centeredFull = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' } as const;
export const heroContainer = { textAlign: 'center', padding: `${spacing.xxxl}px ${spacing.lg}px` } as const;
export const titleBlock = { marginBottom: spacing.xxxl } as const;
export const sectionTitleSpacer = { margin: 0, marginBottom: spacing.sm } as const;

export const sectionTopRow = {
  marginTop: spacing.lg,
  paddingTop: spacing.lg,
  borderTop: `${borderWidths.xs}px solid ${colors.borderMuted}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
} as const;

export const mutedParagraph = { ...muted, marginBottom: spacing.md } as const;

export function buttonDanger() {
  return {
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    background: colors.danger,
    color: 'white',
    border: 'none',
    borderRadius: radii.md,
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } as const;
}

export function buttonPrimary(disabled?: boolean) {
  return {
    padding: '12px 16px',
    background: disabled ? '#9ca3af' : colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: radii.md,
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s',
  } as const;
}

export function buttonSecondary() {
  return {
    padding: '8px 12px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: radii.md,
    transition: 'all 0.2s',
  } as const;
}

export const buttonGhostLight = {
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.2)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: radii.md,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.2s',
} as const;

export function toggleButton(isOn: boolean) {
  return {
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    background: isOn ? '#fef3c7' : '#dbeafe',
    color: isOn ? '#92400e' : '#1e40af',
    border: isOn ? '1px solid #fcd34d' : '1px solid #93c5fd',
    borderRadius: radii.md,
    transition: 'all 0.2s',
  } as const;
}

export const listButton = {
  textAlign: 'left' as const,
  padding: spacing.xl,
  border: `${borderWidths.xs}px solid #e5e7eb`,
  borderRadius: radii.xl,
  background: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: shadows.sm,
};

export const panel = {
  padding: 16,
  background: '#f9fafb',
  borderRadius: 8,
  border: `${borderWidths.xs}px solid #e5e7eb`,
} as const;

export const alertError = {
  padding: 12,
  background: '#fee2e2',
  color: '#991b1b',
  borderRadius: 6,
  fontSize: 14,
  border: `${borderWidths.xs}px solid #fecaca`,
} as const;

export const alertWarning = {
  padding: 16,
  background: '#fff3cd',
  color: '#856404',
  borderRadius: 6,
  borderLeft: `${borderWidths.sm * 2}px solid #ffc107`,
} as const;

export const alertSuccess = {
  padding: 12,
  background: '#d1fae5',
  color: '#065f46',
  borderRadius: 6,
  border: `${borderWidths.xs}px solid #a7f3d0`,
  fontWeight: 500,
} as const;

export const codeBlockMuted = {
  background: '#f0f0f0',
  padding: 12,
  borderRadius: 4,
  fontSize: 12,
} as const;


