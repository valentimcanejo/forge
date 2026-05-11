// Forge — shared UI atoms used across mobile + web screens.
// All purely presentational; consume tokens from forge-tokens.css.

const FG = {
  bg0: '#0B0F14', bg1: '#121826', bg2: '#1A2233', bg3: '#232C40',
  accent: '#F97316', accentMuted: '#C2500A',
  text: '#E6EAF2', mid: '#AAB0C0', dim: '#7B8193',
  ok: '#5ED19A', err: '#E26D6D', warn: '#F0B86E',
  line: 'rgba(255,255,255,0.06)', lineStrong: 'rgba(255,255,255,0.12)',
};

// Logo — anvil-spark glyph + wordmark. Placeholder, swappable later.
function ForgeLogo({ size = 22, mark = true, color = FG.text, accent = FG.accent }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.45 }}>
      {mark && (
        <svg width={size * 1.15} height={size * 1.15} viewBox="0 0 24 24" fill="none">
          {/* anvil + spark */}
          <path d="M3 11h14l-2 4H5z" fill={color}/>
          <rect x="9" y="15" width="6" height="2" fill={color} opacity="0.6"/>
          <rect x="7" y="17" width="10" height="2" rx="0.5" fill={color}/>
          <path d="M18 4l1.4 2.8L22 8l-2.6 1.2L18 12l-1.4-2.8L14 8l2.6-1.2z" fill={accent}/>
        </svg>
      )}
      <span style={{
        fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
        fontSize: size, letterSpacing: '-0.04em', color,
      }}>FORGE</span>
    </span>
  );
}

// Generic card
function FCard({ children, style = {}, elevated = false, onClick, padding = 16 }) {
  return (
    <div onClick={onClick} style={{
      background: elevated ? FG.bg2 : FG.bg1,
      border: `1px solid ${FG.line}`,
      borderRadius: 16,
      padding,
      ...style,
    }}>{children}</div>
  );
}

// Primary action button (orange, with subtle glow)
function FButton({ children, variant = 'primary', size = 'md', icon, style = {}, onClick }) {
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
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      height: sz.height, padding: `0 ${sz.px}px`,
      borderRadius: sz.height / 2,
      background: v.bg, color: v.color,
      border: `1px solid ${v.border}`,
      fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: sz.fs,
      letterSpacing: '-0.01em',
      boxShadow: v.shadow,
      cursor: 'pointer',
      ...style,
    }}>{icon}{children}</button>
  );
}

// Pill / Badge
function FBadge({ children, tone = 'neutral', icon, style = {} }) {
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
      letterSpacing: '0.04em', textTransform: 'uppercase',
      ...style,
    }}>{icon}{children}</span>
  );
}

// Animated progress bar
function FProgress({ value = 0.5, color = FG.accent, height = 6, label }) {
  return (
    <div style={{ width: '100%' }}>
      {label && <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 12, color: FG.mid, marginBottom: 6,
        fontFamily: 'Inter, sans-serif',
      }}>{label}</div>}
      <div style={{
        height, background: 'rgba(255,255,255,0.06)',
        borderRadius: height, overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: color === FG.accent
            ? 'linear-gradient(90deg, #C2500A, #F97316)'
            : color,
          borderRadius: height,
          transformOrigin: 'left',
          transform: `scaleX(${value})`,
          boxShadow: `0 0 12px ${color === FG.accent ? FG.accent : color}66`,
        }} />
      </div>
    </div>
  );
}

// Stat block — big DM Sans number + label
function FStat({ value, unit, label, delta, deltaTone = 'ok', size = 'md', align = 'left' }) {
  const sz = size === 'xl' ? 56 : size === 'lg' ? 40 : size === 'sm' ? 22 : 30;
  return (
    <div style={{ textAlign: align }}>
      {label && <div style={{
        fontSize: 11, color: FG.dim, textTransform: 'uppercase',
        letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace',
        marginBottom: 4,
      }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
        <span className="num" style={{
          fontSize: sz, lineHeight: 1, color: FG.text,
          fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
          letterSpacing: '-0.03em',
        }}>{value}</span>
        {unit && <span style={{ fontSize: sz * 0.4, color: FG.mid, fontWeight: 500 }}>{unit}</span>}
        {delta && (
          <span style={{
            marginLeft: 6, fontSize: 12,
            color: deltaTone === 'ok' ? FG.ok : deltaTone === 'err' ? FG.err : FG.mid,
            fontFamily: 'JetBrains Mono, monospace',
          }}>{delta}</span>
        )}
      </div>
    </div>
  );
}

// Tiny sparkline (SVG path from numeric array)
function FSparkline({ data, w = 120, h = 36, color = FG.accent, fill = true }) {
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
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={fillD} fill="url(#sg)"/>}
      <path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Macro ring (SVG donut)
function FRing({ value, size = 60, stroke = 6, color = FG.accent, label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value);
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}/>
      </svg>
      {(label || sub) && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        }}>
          {label && <span style={{ fontSize: size * 0.22, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em' }}>{label}</span>}
          {sub && <span style={{ fontSize: size * 0.13, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

// Bar/Line chart for web
function FBars({ data, w = 320, h = 120, color = FG.accent }) {
  const max = Math.max(...data);
  const bw = w / data.length;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {data.map((v, i) => {
        const bh = (v / max) * (h - 8);
        return (
          <rect key={i}
            x={i * bw + bw * 0.18} y={h - bh}
            width={bw * 0.64} height={bh}
            rx={3}
            fill={i === data.length - 1 ? color : 'rgba(249,115,22,0.35)'}/>
        );
      })}
    </svg>
  );
}

// Section header with kicker
function FSectionHead({ kicker, title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        {kicker && <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          textTransform: 'uppercase', letterSpacing: '0.16em',
          color: FG.accent, marginBottom: 4,
        }}>{kicker}</div>}
        <h3 style={{ fontSize: 18, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h3>
      </div>
      {action && <button style={{
        background: 'transparent', border: 'none', color: FG.mid,
        fontSize: 13, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
      }}>{action}</button>}
    </div>
  );
}

// Check pill (used in workout list)
function FCheck({ checked }) {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: 12,
      border: `1.5px solid ${checked ? FG.accent : FG.lineStrong}`,
      background: checked ? FG.accent : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="#1a0a00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

// Tab bar (mobile)
function FTabBar({ active = 'home' }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'M3 12L12 4l9 8M5 10v10h14V10' },
    { id: 'lift', label: 'Lift',  icon: 'M4 9h2v6H4zM18 9h2v6h-2zM7 11h10v2H7zM2 10h2v4H2zM20 10h2v4h-2z' },
    { id: 'eat', label: 'Eat',   icon: 'M6 3v9a3 3 0 003 3v6h2v-6a3 3 0 003-3V3M9 3v6M13 3v6M19 3c-1 2-1 5 0 8v10' },
    { id: 'progress', label: 'Progress', icon: 'M3 17l6-6 4 4 8-8' },
    { id: 'profile', label: 'You', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 10,
      background: 'linear-gradient(180deg, rgba(11,15,20,0) 0%, rgba(11,15,20,0.92) 35%, rgba(11,15,20,1) 100%)',
      backdropFilter: 'blur(20px)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      borderTop: `1px solid ${FG.line}`,
      zIndex: 10,
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <div key={t.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: on ? FG.accent : FG.dim,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={t.icon}/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em' }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Mobile screen container — sets bg + scroll
function FMobileScreen({ children, padTop = 60, padBottom = 100 }) {
  return (
    <div className="forge" style={{
      width: '100%', height: '100%', background: FG.bg0,
      paddingTop: padTop, paddingBottom: padBottom,
      position: 'relative',
    }}>{children}</div>
  );
}

Object.assign(window, {
  FG, ForgeLogo, FCard, FButton, FBadge, FProgress, FStat, FSparkline, FRing,
  FBars, FSectionHead, FCheck, FTabBar, FMobileScreen,
});
