import { fontSizes, fontWeights } from '../theme/tokens';

export const h1 = {
  fontSize: fontSizes['3xl'],
  fontWeight: fontWeights.bold,
  margin: 0,
} as const;

export const h2 = {
  fontSize: fontSizes['2xl'],
  fontWeight: fontWeights.semibold,
  margin: 0,
} as const;

export const subtitle = {
  fontSize: fontSizes.md,
  color: 'rgba(17, 24, 39, 0.7)',
  margin: 0,
} as const;

export const muted = {
  fontSize: fontSizes.sm,
  color: '#6b7280',
} as const;


