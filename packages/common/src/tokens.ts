export const FG = {
  bg0: '#0B0F14',
  bg1: '#121826',
  bg2: '#1A2233',
  bg3: '#232C40',
  accent: '#F97316',
  accentMuted: '#C2500A',
  accentSoft: 'rgba(249,115,22,0.12)',
  accentGlow: 'rgba(249,115,22,0.35)',
  text: '#E6EAF2',
  mid: '#AAB0C0',
  dim: '#7B8193',
  ok: '#5ED19A',
  err: '#E26D6D',
  warn: '#F0B86E',
  line: 'rgba(255,255,255,0.06)',
  lineStrong: 'rgba(255,255,255,0.12)',
} as const;

export const FONTS = {
  display: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  body: '"Inter", ui-sans-serif, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
} as const;

export const RADII = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
} as const;

export const SHADOWS = {
  s1: '0 1px 0 rgba(255,255,255,0.04) inset, 0 6px 14px rgba(0,0,0,0.35)',
  s2: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px rgba(0,0,0,0.45)',
} as const;
