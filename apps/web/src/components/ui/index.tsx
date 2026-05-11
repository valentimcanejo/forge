'use client';
import React, { type CSSProperties } from 'react';

const FG = {
  bg0: '#0B0F14', bg1: '#121826', bg2: '#1A2233', bg3: '#232C40',
  accent: '#F97316', accentMuted: '#C2500A',
  text: '#E6EAF2', mid: '#AAB0C0', dim: '#7B8193',
  ok: '#5ED19A', err: '#E26D6D', warn: '#F0B86E',
  line: 'rgba(255,255,255,0.06)', lineStrong: 'rgba(255,255,255,0.12)',
};

export function ForgeLogo({ size = 22, mark = true }: { size?: number; mark?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.45 }}>
      {mark && (
        <svg width={size * 1.15} height={size * 1.15} viewBox="0 0 24 24" fill="none">
          <path d="M3 11h14l-2 4H5z" fill={FG.text}/>
          <rect x="9" y="15" width="6" height="2" fill={FG.text} opacity="0.6"/>
          <rect x="7" y="17" width="10" height="2" rx="0.5" fill={FG.text}/>
          <path d="M18 4l1.4 2.8L22 8l-2.6 1.2L18 12l-1.4-2.8L14 8l2.6-1.2z" fill={FG.accent}/>
        </svg>
      )}
      <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: size, letterSpacing: '-0.04em', color: FG.text }}>FORGE</span>
    </span>
  );
}

interface FCardProps {
  children: React.ReactNode;
  style?: CSSProperties;
  elevated?: boolean;
  padding?: number;
  onClick?: () => void;
  className?: string;
}

export function FCard({ children, style = {}, elevated = false, padding = 16, onClick, className }: FCardProps) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: elevated ? FG.bg2 : FG.bg1,
        border: `1px solid ${FG.line}`,
        borderRadius: 16,
        padding,
        ...(onClick ? { cursor: 'pointer' } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface FButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'soft' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export function FButton({ children, variant = 'primary', size = 'md', icon, style = {}, onClick, disabled, type = 'button', fullWidth }: FButtonProps) {
  const sz = size === 'lg' ? { height: 52, fs: 16, px: 24 }
           : size === 'sm' ? { height: 32, fs: 13, px: 12 }
           : { height: 44, fs: 14, px: 18 };
  const variants = {
    primary: { bg: FG.accent, color: '#1a0a00', border: 'transparent', shadow: '0 6px 20px rgba(249,115,22,0.35)' },
    ghost:   { bg: 'transparent', color: FG.text, border: FG.lineStrong, shadow: 'none' },
    soft:    { bg: 'rgba(249,115,22,0.12)', color: FG.accent, border: 'rgba(249,115,22,0.25)', shadow: 'none' },
    danger:  { bg: 'transparent', color: FG.err, border: 'rgba(226,109,109,0.3)', shadow: 'none' },
  };
  const v = variants[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: sz.height, padding: `0 ${sz.px}px`,
        borderRadius: sz.height / 2,
        background: disabled ? 'rgba(255,255,255,0.06)' : v.bg,
        color: disabled ? FG.dim : v.color,
        border: `1px solid ${v.border}`,
        fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: sz.fs,
        letterSpacing: '-0.01em',
        boxShadow: disabled ? 'none' : v.shadow,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.15s, transform 0.1s',
        width: fullWidth ? '100%' : undefined,
        ...style,
      }}
    >
      {icon}{children}
    </button>
  );
}

interface FBadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'ok' | 'warn' | 'err';
  icon?: React.ReactNode;
  style?: CSSProperties;
}

export function FBadge({ children, tone = 'neutral', icon, style = {} }: FBadgeProps) {
  const tones = {
    neutral: { bg: 'rgba(255,255,255,0.06)', color: FG.text, border: FG.line },
    accent:  { bg: 'rgba(249,115,22,0.14)', color: FG.accent, border: 'rgba(249,115,22,0.3)' },
    ok:      { bg: 'rgba(94,209,154,0.12)', color: FG.ok, border: 'rgba(94,209,154,0.3)' },
    warn:    { bg: 'rgba(240,184,110,0.12)', color: FG.warn, border: 'rgba(240,184,110,0.3)' },
    err:     { bg: 'rgba(226,109,109,0.12)', color: FG.err, border: 'rgba(226,109,109,0.3)' },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 999,
      background: t.bg, color: t.color, border: `1px solid ${t.border}`,
      fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 11,
      letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
      ...style,
    }}>
      {icon}{children}
    </span>
  );
}

interface FProgressProps {
  value: number;
  color?: string;
  height?: number;
  label?: [React.ReactNode, React.ReactNode];
}

export function FProgress({ value, color = FG.accent, height = 6, label }: FProgressProps) {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: FG.mid, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>
          {label[0]}{label[1]}
        </div>
      )}
      <div style={{ height, background: 'rgba(255,255,255,0.06)', borderRadius: height, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: color === FG.accent ? 'linear-gradient(90deg, #C2500A, #F97316)' : color,
          borderRadius: height,
          transformOrigin: 'left',
          transform: `scaleX(${Math.min(Math.max(value, 0), 1)})`,
          transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 12px ${color === FG.accent ? FG.accent : color}66`,
        }}/>
      </div>
    </div>
  );
}

interface FStatProps {
  value: string | number;
  unit?: string;
  label?: string;
  delta?: string;
  deltaTone?: 'ok' | 'err' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center';
}

export function FStat({ value, unit, label, delta, deltaTone = 'ok', size = 'md', align = 'left' }: FStatProps) {
  const sz = size === 'xl' ? 56 : size === 'lg' ? 40 : size === 'sm' ? 22 : 30;
  return (
    <div style={{ textAlign: align }}>
      {label && (
        <div style={{ fontSize: 11, color: FG.dim, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>{label}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
        <span className="num" style={{ fontSize: sz, lineHeight: 1, color: FG.text, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.03em' }}>{value}</span>
        {unit && <span style={{ fontSize: sz * 0.4, color: FG.mid, fontWeight: 500 }}>{unit}</span>}
        {delta && (
          <span style={{ marginLeft: 6, fontSize: 12, color: deltaTone === 'ok' ? FG.ok : deltaTone === 'err' ? FG.err : FG.mid, fontFamily: 'JetBrains Mono, monospace' }}>{delta}</span>
        )}
      </div>
    </div>
  );
}

export function FSparkline({ data, w = 120, h = 36, color = FG.accent, fill = true }: { data: number[]; w?: number; h?: number; color?: string; fill?: boolean }) {
  if (!data.length) return <svg width={w} height={h}/>;
  const max = Math.max(...data), min = Math.min(...data);
  const range = (max - min) || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const fillD = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${w}-${h}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={fillD} fill={`url(#sg-${w}-${h})`}/>}
      <path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function FRing({ value, size = 60, stroke = 6, color = FG.accent, label, sub }: { value: number; size?: number; stroke?: number; color?: string; label?: string; sub?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(Math.max(value, 0), 1));
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}/>
      </svg>
      {(label || sub) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          {label && <span style={{ fontSize: size * 0.22, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em', lineHeight: 1 }}>{label}</span>}
          {sub && <span style={{ fontSize: size * 0.13, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

export function FBars({ data, w = 320, h = 120, color = FG.accent }: { data: number[]; w?: number; h?: number; color?: string }) {
  const max = Math.max(...data, 1);
  const bw = w / data.length;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {data.map((v, i) => {
        const bh = (v / max) * (h - 8);
        return (
          <rect key={i}
            x={i * bw + bw * 0.18} y={h - bh}
            width={bw * 0.64} height={bh || 2}
            rx={3}
            fill={i === data.length - 1 ? color : 'rgba(249,115,22,0.35)'}/>
        );
      })}
    </svg>
  );
}

interface FSectionHeadProps {
  kicker?: string;
  title: string;
  action?: React.ReactNode;
}

export function FSectionHead({ kicker, title, action }: FSectionHeadProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        {kicker && (
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: FG.accent, marginBottom: 4 }}>{kicker}</div>
        )}
        <h3 style={{ fontSize: 18, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h3>
      </div>
      {action && (
        <div style={{ color: FG.mid, fontSize: 13, fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>{action}</div>
      )}
    </div>
  );
}

export function FCheck({ checked }: { checked: boolean }) {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: 12,
      border: `1.5px solid ${checked ? FG.accent : FG.lineStrong}`,
      background: checked ? FG.accent : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      transition: 'background 0.15s, border-color 0.15s',
    }}>
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="#1a0a00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

export { FG };
