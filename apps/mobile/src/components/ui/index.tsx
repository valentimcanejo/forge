import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { FG } from '@/constants/theme';

// ── FCard ────────────────────────────────────────────────────────
interface FCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padding?: number;
  onPress?: () => void;
}
export function FCard({ children, style, elevated, padding = 16, onPress }: FCardProps) {
  const baseStyle = [{
    backgroundColor: elevated ? FG.bg2 : FG.bg1,
    borderWidth: 1, borderColor: FG.line,
    borderRadius: 16, padding,
  }, style] as any;
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={baseStyle}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={baseStyle}>{children}</View>;
}

// ── FButton ──────────────────────────────────────────────────────
interface FButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'soft' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}
export function FButton({ children, variant = 'primary', size = 'md', onPress, disabled, style, fullWidth }: FButtonProps) {
  const heights = { sm: 32, md: 44, lg: 52 };
  const fontSizes = { sm: 13, md: 14, lg: 16 };
  const paddings = { sm: 12, md: 18, lg: 24 };

  const variantStyles: Record<string, { bg: string; color: string; borderColor: string }> = {
    primary: { bg: FG.accent, color: '#1a0a00', borderColor: 'transparent' },
    ghost:   { bg: 'transparent', color: FG.text, borderColor: FG.lineStrong },
    soft:    { bg: 'rgba(249,115,22,0.12)', color: FG.accent, borderColor: 'rgba(249,115,22,0.25)' },
    danger:  { bg: 'transparent', color: FG.err, borderColor: 'rgba(226,109,109,0.3)' },
  };
  const v = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[{
        height: heights[size],
        paddingHorizontal: paddings[size],
        borderRadius: heights[size] / 2,
        backgroundColor: disabled ? 'rgba(255,255,255,0.06)' : v.bg,
        borderWidth: 1, borderColor: v.borderColor,
        alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
        opacity: disabled ? 0.5 : 1,
        ...(fullWidth ? { width: '100%' as any } : {}),
      }, style]}
    >
      <Text style={{ fontSize: fontSizes[size], fontWeight: '600', color: disabled ? FG.dim : v.color, letterSpacing: -0.1 }}>{children}</Text>
    </TouchableOpacity>
  );
}

// ── FBadge ───────────────────────────────────────────────────────
interface FBadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'ok' | 'warn' | 'err';
  style?: ViewStyle;
}
export function FBadge({ children, tone = 'neutral', style }: FBadgeProps) {
  const tones = {
    neutral: { bg: 'rgba(255,255,255,0.06)', color: FG.text, border: FG.line },
    accent:  { bg: 'rgba(249,115,22,0.14)', color: FG.accent, border: 'rgba(249,115,22,0.3)' },
    ok:      { bg: 'rgba(94,209,154,0.12)', color: FG.ok, border: 'rgba(94,209,154,0.3)' },
    warn:    { bg: 'rgba(240,184,110,0.12)', color: FG.warn, border: 'rgba(240,184,110,0.3)' },
    err:     { bg: 'rgba(226,109,109,0.12)', color: FG.err, border: 'rgba(226,109,109,0.3)' },
  };
  const t = tones[tone];
  return (
    <View style={[{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: t.bg, borderWidth: 1, borderColor: t.border }, style]}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: t.color, letterSpacing: 0.5, textTransform: 'uppercase' }}>{children}</Text>
    </View>
  );
}

// ── FProgress ────────────────────────────────────────────────────
interface FProgressProps {
  value: number;
  color?: string;
  height?: number;
}
export function FProgress({ value, color = FG.accent, height = 6 }: FProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 1);
  return (
    <View style={{ height, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: height, overflow: 'hidden' }}>
      <View style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: `${clamped * 100}%`,
        backgroundColor: color,
        borderRadius: height,
      }}/>
    </View>
  );
}

// ── FRing ────────────────────────────────────────────────────────
interface FRingProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sub?: string;
}
export function FRing({ value, size = 60, stroke = 6, color = FG.accent, label, sub }: FRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(Math.max(value, 0), 1));
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none"/>
        <Circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={`${c}`} strokeDashoffset={off}/>
      </Svg>
      {(label || sub) && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          {label && <Text style={{ fontSize: size * 0.22, fontWeight: '700', color: FG.text, letterSpacing: -0.5 }}>{label}</Text>}
          {sub && <Text style={{ fontSize: size * 0.13, color: FG.dim }}>{sub}</Text>}
        </View>
      )}
    </View>
  );
}

// ── FCheck ───────────────────────────────────────────────────────
export function FCheck({ checked }: { checked: boolean }) {
  return (
    <View style={{
      width: 24, height: 24, borderRadius: 12,
      borderWidth: 1.5, borderColor: checked ? FG.accent : FG.lineStrong,
      backgroundColor: checked ? FG.accent : 'transparent',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {checked && (
        <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
          <Path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="#1a0a00" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      )}
    </View>
  );
}

// ── FSparkline ───────────────────────────────────────────────────
export function FSparkline({ data, w = 120, h = 36, color = FG.accent }: { data: number[]; w?: number; h?: number; color?: string }) {
  if (!data.length) return <View style={{ width: w, height: h }}/>;
  const max = Math.max(...data), min = Math.min(...data);
  const range = (max - min) || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const fillD = `${d} L${w},${h} L0,${h} Z`;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <LinearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <Stop offset="100%" stopColor={color} stopOpacity="0"/>
        </LinearGradient>
      </Defs>
      <Path d={fillD} fill="url(#sg)"/>
      <Path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

// ── FTabBar ──────────────────────────────────────────────────────
export function FTabBar({ active }: { active: string }) {
  const tabs = [
    { id: 'home', label: 'Home', d: 'M3 12L12 4l9 8M5 10v10h14V10' },
    { id: 'lift', label: 'Lift', d: 'M4 9h2v6H4zM18 9h2v6h-2zM7 11h10v2H7zM2 10h2v4H2zM20 10h2v4h-2z' },
    { id: 'eat',  label: 'Eat',  d: 'M6 3v9a3 3 0 003 3v6h2v-6a3 3 0 003-3V3M9 3v6M13 3v6M19 3c-1 2-1 5 0 8v10' },
    { id: 'progress', label: 'Progress', d: 'M3 17l6-6 4 4 8-8' },
    { id: 'you', label: 'You', d: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8' },
  ];
  return (
    <View style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 10,
      backgroundColor: FG.bg0,
      borderTopWidth: 1, borderTopColor: FG.line,
      flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <View key={t.id} style={{ alignItems: 'center', gap: 4 }}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={on ? FG.accent : FG.dim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d={t.d}/>
            </Svg>
            <Text style={{ fontSize: 10, fontWeight: '600', color: on ? FG.accent : FG.dim, letterSpacing: 0.3 }}>{t.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
