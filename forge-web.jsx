// Forge web screens — desktop dashboard, sidebar layout, dense data.
// Rendered at 1280×820 inside a browser-window chrome.

function WebSidebar({ active = 'dashboard' }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12L12 4l9 8M5 10v10h14V10' },
    { id: 'workouts', label: 'Workouts',  icon: 'M4 9h2v6H4zM18 9h2v6h-2zM7 11h10v2H7zM2 10h2v4H2zM20 10h2v4h-2z' },
    { id: 'meals', label: 'Meals',     icon: 'M6 3v9a3 3 0 003 3v6h2v-6a3 3 0 003-3V3M9 3v6M13 3v6M19 3c-1 2-1 5 0 8v10' },
    { id: 'progress', label: 'Progress',  icon: 'M3 17l6-6 4 4 8-8' },
    { id: 'badges', label: 'Badges',    icon: 'M12 2l2.5 5 5.5.8-4 3.9.9 5.5L12 14.6 7.1 17.2 8 11.7 4 7.8l5.5-.8z' },
    { id: 'library', label: 'Library',   icon: 'M4 4h6v16H4zM14 4h6v6h-6zM14 14h6v6h-6z' },
  ];
  return (
    <div style={{
      width: 220, height: '100%', background: FG.bg1,
      borderRight: `1px solid ${FG.line}`,
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
    }}>
      <div style={{ padding: '22px 22px 28px' }}>
        <ForgeLogo size={20}/>
      </div>
      <div style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => {
          const on = it.id === active;
          return (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10,
              background: on ? 'rgba(249,115,22,0.12)' : 'transparent',
              color: on ? FG.accent : FG.mid,
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
              position: 'relative',
            }}>
              {on && <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, borderRadius: 2, background: FG.accent }}/>}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={it.icon}/></svg>
              {it.label}
            </div>
          );
        })}
      </div>
      <div style={{ padding: 12, borderTop: `1px solid ${FG.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8 }}>
          <div className="imgph" style={{ width: 32, height: 32, borderRadius: 10 }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Diego Rocha</div>
            <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>LVL 7 · 14d</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth="2"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
        </div>
      </div>
    </div>
  );
}

function WebTopBar({ title, subtitle, action }) {
  return (
    <div style={{
      padding: '20px 32px', borderBottom: `1px solid ${FG.line}`,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div>
        <h1 style={{ fontSize: 24, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: FG.mid, marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{
          background: FG.bg1, border: `1px solid ${FG.line}`,
          borderRadius: 10, padding: '8px 12px', width: 240,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <span style={{ color: FG.dim, fontSize: 12, fontFamily: 'Inter, sans-serif', flex: 1 }}>Search…</span>
          <span style={{ color: FG.dim, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', padding: '2px 5px', background: FG.bg2, borderRadius: 4 }}>⌘K</span>
        </div>
        {action || <FButton size="sm">+ Log workout</FButton>}
      </div>
    </div>
  );
}

function WebShell({ active, title, subtitle, action, children, scroll = true }) {
  return (
    <div className="forge" style={{
      width: '100%', height: '100%', background: FG.bg0,
      display: 'flex', overflow: 'hidden',
    }}>
      <WebSidebar active={active}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <WebTopBar title={title} subtitle={subtitle} action={action}/>
        <div style={{ flex: 1, overflow: scroll ? 'auto' : 'hidden', padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── WEB · DASHBOARD ───────────────────────────────────────────
function WebDashboard() {
  const trend = [78.2, 78.0, 77.8, 78.1, 77.5, 77.2, 77.0, 76.8, 76.9, 76.5, 76.2, 75.9];
  const volWeek = [4200, 5100, 0, 6800, 5400, 7200, 8420];
  return (
    <WebShell active="dashboard" title="Hey, Diego." subtitle="Tuesday, May 12 · Day 14 of streak">
      {/* Top stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { k: 'BODY WEIGHT', v: '75.9', u: 'kg', d: '−2.3 kg · 12W', tone: 'ok', spark: trend },
          { k: 'WEEKLY VOLUME', v: '37.1', u: 'k lb', d: '+8% · vs last wk', tone: 'ok', spark: volWeek },
          { k: 'PROTEIN AVG', v: '168', u: 'g/day', d: 'target 180g', tone: 'warn' },
          { k: 'XP TO LVL 8', v: '860', u: 'xp', d: '68% complete', tone: 'accent' },
        ].map((s, i) => (
          <FCard key={i} padding={16}>
            <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>{s.k}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <span className="num" style={{ fontSize: 28 }}>{s.v}</span>
              <span style={{ color: FG.mid, fontSize: 12 }}>{s.u}</span>
            </div>
            <div style={{
              fontSize: 11, marginTop: 4,
              color: s.tone === 'ok' ? FG.ok : s.tone === 'warn' ? FG.warn : FG.accent,
              fontFamily: 'JetBrains Mono, monospace',
            }}>{s.d}</div>
            {s.spark && <div style={{ marginTop: 8 }}><FSparkline data={s.spark} w={220} h={40}/></div>}
          </FCard>
        ))}
      </div>

      {/* Main 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, marginBottom: 18 }}>
        {/* Body weight chart */}
        <FCard padding={20}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <FSectionHead kicker="BODY WEIGHT" title="12 week trend"/>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['1M','3M','6M','1Y'].map((t, i) => (
                <button key={t} style={{
                  padding: '5px 10px', borderRadius: 6,
                  background: i === 1 ? FG.bg2 : 'transparent',
                  border: `1px solid ${i === 1 ? FG.lineStrong : 'transparent'}`,
                  color: i === 1 ? FG.text : FG.mid,
                  fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500,
                }}>{t}</button>
              ))}
            </div>
          </div>
          <FSparkline data={trend} w={520} h={180}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
            <span>FEB 14</span><span>MAR</span><span>APR</span><span>MAY 12</span>
          </div>
        </FCard>

        {/* Today's workout */}
        <FCard padding={0} style={{ overflow: 'hidden' }}>
          <div className="imgph" data-label="// hero · barbell bench" data-tone="warm" style={{ height: 100 }}>
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
              <FBadge tone="accent">PUSH DAY</FBadge>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>TODAY · 5 LIFTS · 52 MIN</div>
            <h3 style={{ fontSize: 18, marginTop: 6, fontFamily: 'DM Sans, sans-serif' }}>Chest & Triceps</h3>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Bench Press · 4×6-8 · 185 lb', 'Incline Press · 3×8 · 70 lb', 'Cable Fly · 3×12 · 40 lb', 'Skullcrushers · 3×10 · 60 lb'].map((l,i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: FG.mid, fontFamily: 'Inter, sans-serif' }}>
                  <FCheck checked={false}/> <span>{l}</span>
                </div>
              ))}
            </div>
            <FButton size="md" style={{ width: '100%', marginTop: 16 }}>Start session →</FButton>
          </div>
        </FCard>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {/* Macros */}
        <FCard padding={18}>
          <FSectionHead kicker="TODAY" title="Macros"/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <FRing value={0.69} size={88} stroke={8} label="69%" sub="kcal"/>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { l: 'Protein', v: 142, t: 180, c: FG.accent },
                { l: 'Carbs',   v: 210, t: 320, c: FG.warn },
                { l: 'Fat',     v: 58,  t: 80,  c: FG.ok },
              ].map(m => (
                <div key={m.l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3, color: FG.mid }}>
                    <span>{m.l}</span><span className="mono" style={{ color: FG.text }}>{m.v}/{m.t}g</span>
                  </div>
                  <FProgress value={m.v/m.t} color={m.c} height={4}/>
                </div>
              ))}
            </div>
          </div>
        </FCard>

        {/* Volume bars */}
        <FCard padding={18}>
          <FSectionHead kicker="THIS WEEK" title="Volume"/>
          <FBars data={volWeek} w={260} h={120}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
            {['M','T','W','T','F','S','S'].map((d,i) => <span key={i} style={{ flex: 1, textAlign: 'center', color: i === 6 ? FG.accent : FG.dim }}>{d}</span>)}
          </div>
        </FCard>

        {/* Recent activity */}
        <FCard padding={18}>
          <FSectionHead kicker="ACTIVITY" title="Recent"/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { i: '⚒', t: 'Iron Forger badge', s: '2 min ago', c: FG.accent },
              { i: '↗', t: 'Bench PR · 185 lb × 8', s: 'Yesterday', c: FG.accent },
              { i: '🔥', t: 'Streak day 14', s: 'Today', c: FG.warn },
              { i: '✓', t: 'Pull day completed', s: '2 days ago', c: FG.ok },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${a.c}1A`, color: a.c, border: `1px solid ${a.c}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{a.i}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.t}</div>
                  <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>{a.s}</div>
                </div>
              </div>
            ))}
          </div>
        </FCard>
      </div>
    </WebShell>
  );
}

// ─── WEB · WORKOUT TABLE ───────────────────────────────────────
function WebWorkout() {
  const rows = [
    { name: 'Barbell Bench Press', m: 'Chest', sets: '4×6-8', target: '185 lb', last: '180 lb', pr: '195 lb', delta: '+5', vol: 4440, status: 'done' },
    { name: 'Incline Dumbbell Press', m: 'Chest', sets: '3×8-10', target: '70 lb', last: '65 lb', pr: '70 lb', delta: '+5', vol: 1680, status: 'done' },
    { name: 'Cable Fly', m: 'Chest', sets: '3×12', target: '40 lb', last: '40 lb', pr: '45 lb', delta: '—', vol: 1440, status: 'active' },
    { name: 'Skullcrushers', m: 'Triceps', sets: '3×10', target: '60 lb', last: '55 lb', pr: '60 lb', delta: '+5', vol: 0, status: 'pending' },
    { name: 'Cable Pushdown', m: 'Triceps', sets: '3×12', target: '50 lb', last: '50 lb', pr: '55 lb', delta: '—', vol: 0, status: 'pending' },
    { name: 'Overhead Tricep Ext.', m: 'Triceps', sets: '3×12', target: '35 lb', last: '30 lb', pr: '35 lb', delta: '+5', vol: 0, status: 'pending' },
  ];
  return (
    <WebShell active="workouts" title="Push Day" subtitle="Week 6 · Push / Pull / Legs · Tue May 12"
      action={<>
        <FButton variant="ghost" size="sm">Export</FButton>
        <FButton size="sm">+ Add lift</FButton>
      </>}>
      {/* Session header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
        <FCard padding={16} style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.02))', borderColor: 'rgba(249,115,22,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: FG.accent, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>SESSION ACTIVE</div>
              <div className="num" style={{ fontSize: 32, marginTop: 2 }}>32:14</div>
              <div style={{ fontSize: 11, color: FG.dim, marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>STARTED 18:42</div>
            </div>
            <button style={{
              width: 50, height: 50, borderRadius: 25, background: FG.accent, border: 'none',
              boxShadow: '0 8px 22px rgba(249,115,22,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a0a00"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
            </button>
          </div>
        </FCard>
        {[
          { k: 'VOLUME', v: '8,420', u: 'lb' },
          { k: 'SETS DONE', v: '7', u: '/ 18' },
          { k: 'AVG REST', v: '2:14', u: 'min' },
        ].map((s, i) => (
          <FCard key={i} padding={16}>
            <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>{s.k}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
              <span className="num" style={{ fontSize: 26 }}>{s.v}</span>
              <span style={{ color: FG.mid, fontSize: 11 }}>{s.u}</span>
            </div>
          </FCard>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        {['All', 'Chest', 'Triceps'].map((t, i) => (
          <button key={t} style={{
            padding: '6px 12px', borderRadius: 99,
            background: i === 0 ? 'rgba(249,115,22,0.12)' : FG.bg1,
            border: `1px solid ${i === 0 ? 'rgba(249,115,22,0.3)' : FG.line}`,
            color: i === 0 ? FG.accent : FG.mid,
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
          }}>{t}</button>
        ))}
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>SHOWING 6 LIFTS</span>
      </div>

      {/* Table */}
      <div style={{
        background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '32px 2.4fr 1fr 1fr 1fr 1fr 1fr 1fr 32px',
          padding: '12px 16px', gap: 12,
          fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.12em', borderBottom: `1px solid ${FG.line}`,
          textTransform: 'uppercase',
        }}>
          <span></span>
          <span>EXERCISE</span>
          <span>MUSCLE</span>
          <span>SETS</span>
          <span>TARGET</span>
          <span>LAST</span>
          <span>PR</span>
          <span>VOLUME</span>
          <span></span>
        </div>
        {rows.map((r, i) => {
          const done = r.status === 'done';
          const active = r.status === 'active';
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '32px 2.4fr 1fr 1fr 1fr 1fr 1fr 1fr 32px',
              padding: '14px 16px', gap: 12, alignItems: 'center',
              borderBottom: i < rows.length - 1 ? `1px solid ${FG.line}` : 'none',
              background: active ? 'rgba(249,115,22,0.04)' : 'transparent',
              opacity: done ? 0.65 : 1,
            }}>
              <FCheck checked={done}/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="imgph" data-tone={active ? 'warm' : ''} style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }}/>
                <span style={{ fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, textDecoration: done ? 'line-through' : 'none' }}>{r.name}</span>
              </div>
              <span style={{ fontSize: 12, color: FG.mid }}>{r.m}</span>
              <span className="mono" style={{ fontSize: 12, color: FG.mid }}>{r.sets}</span>
              <span className="num" style={{ fontSize: 13, color: FG.text }}>{r.target}</span>
              <span style={{ fontSize: 12, color: FG.mid, fontFamily: 'JetBrains Mono, monospace' }}>{r.last}</span>
              <span style={{ fontSize: 12, color: FG.accent, fontFamily: 'JetBrains Mono, monospace' }}>{r.pr}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="mono" style={{ fontSize: 11, color: FG.text }}>{r.vol ? r.vol.toLocaleString() : '—'}</span>
                {r.delta !== '—' && <FBadge tone="ok" style={{ padding: '2px 6px', fontSize: 9 }}>{r.delta}</FBadge>}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth="2"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
            </div>
          );
        })}
      </div>
    </WebShell>
  );
}

// ─── WEB · DIET ────────────────────────────────────────────────
function WebDiet() {
  const meals = [
    { name: 'Breakfast', time: '08:30', items: ['Oats 80g', 'Whey 30g', 'Banana'], kcal: 540, p: 38, c: 78, f: 12, status: 'done' },
    { name: 'Lunch',     time: '13:00', items: ['Chicken 200g', 'Rice 150g', 'Broccoli'], kcal: 720, p: 55, c: 88, f: 18, status: 'done' },
    { name: 'Snack',     time: '16:30', items: ['Greek yogurt', 'Almonds 20g'], kcal: 320, p: 22, c: 18, f: 18, status: 'done' },
    { name: 'Dinner',    time: '20:00', items: ['Plan dinner →'], kcal: 0, p: 0, c: 0, f: 0, status: 'planned' },
  ];
  const subs = [
    { from: 'White rice', to: 'Jasmine rice', d: '+2g protein, same kcal' },
    { from: 'Whey shake', to: 'Cottage cheese 250g', d: '−40 kcal, +slow protein' },
    { from: 'Almonds', to: 'Pistachios 25g', d: '+similar profile, lower fat' },
  ];
  return (
    <WebShell active="meals" title="Today's plate" subtitle="2,650 kcal target · cut phase · day 12 of 28"
      action={<>
        <FButton variant="ghost" size="sm">Plan week</FButton>
        <FButton size="sm">+ Log food</FButton>
      </>}>

      {/* Top: macro overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
        <FCard padding={20}>
          <FSectionHead kicker="OVERVIEW" title="Daily totals"/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <FRing value={0.69} size={130} stroke={11} label="1,820" sub="of 2,650"/>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { l: 'Protein', v: 142, t: 180, c: FG.accent, kcal: 568 },
                { l: 'Carbs',   v: 210, t: 320, c: FG.warn, kcal: 840 },
                { l: 'Fat',     v: 58,  t: 80,  c: FG.ok, kcal: 522 },
              ].map(m => (
                <div key={m.l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: FG.mid, fontFamily: 'Inter, sans-serif' }}>{m.l}</span>
                    <span className="mono" style={{ color: FG.text }}>{m.v}<span style={{ color: FG.dim }}>/{m.t}g</span></span>
                  </div>
                  <FProgress value={m.v/m.t} color={m.c} height={5}/>
                </div>
              ))}
            </div>
          </div>
        </FCard>
        <FCard padding={18}>
          <FSectionHead kicker="WATER" title="Hydration"/>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
            <span className="num" style={{ fontSize: 38 }}>1.2</span>
            <span style={{ color: FG.mid }}>/ 3.0 L</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} style={{ flex: 1, height: 36, borderRadius: 6, background: i <= 3 ? 'rgba(94,209,154,0.4)' : 'rgba(255,255,255,0.04)', border: `1px solid ${i <= 3 ? 'rgba(94,209,154,0.4)' : FG.line}` }}/>
            ))}
          </div>
          <FButton variant="soft" size="sm" style={{ marginTop: 12, width: '100%' }}>+ 250 ml</FButton>
        </FCard>
        <FCard padding={18}>
          <FSectionHead kicker="WEIGHT" title="Body"/>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span className="num" style={{ fontSize: 38 }}>75.9</span>
            <span style={{ color: FG.mid, fontSize: 13 }}>kg</span>
            <FBadge tone="ok" style={{ marginLeft: 4 }}>−0.3</FBadge>
          </div>
          <FSparkline data={[76.5, 76.4, 76.2, 76.3, 76.0, 75.9]} w={260} h={50}/>
          <div style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>LAST 7 DAYS</div>
        </FCard>
      </div>

      {/* Meals + suggestions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <div>
          <FSectionHead kicker="MEALS · TUESDAY" title="Today's plan" action="Edit week"/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {meals.map((m, i) => {
              const planned = m.status === 'planned';
              return (
                <FCard key={i} padding={16} style={{ opacity: planned ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div className="imgph" data-tone={!planned ? 'warm' : ''} style={{
                      width: 60, height: 60, borderRadius: 12, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                    }}>{['🍳','🍱','🥗','◯'][i]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <h3 style={{ fontSize: 15, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>{m.name}</h3>
                        <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>{m.time}</span>
                      </div>
                      <div style={{ fontSize: 12, color: FG.mid, marginTop: 3 }}>{m.items.join(' · ')}</div>
                    </div>
                    {!planned && (
                      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div className="num" style={{ fontSize: 18 }}>{m.kcal}</div>
                          <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>KCAL</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <FBadge tone="accent">{m.p}P</FBadge>
                          <FBadge tone="warn">{m.c}C</FBadge>
                          <FBadge tone="ok">{m.f}F</FBadge>
                        </div>
                      </div>
                    )}
                    {planned && <FButton variant="soft" size="sm">Plan dinner</FButton>}
                  </div>
                </FCard>
              );
            })}
          </div>
        </div>

        <div>
          <FSectionHead kicker="SUGGESTIONS" title="Smart swaps"/>
          <FCard padding={0}>
            {subs.map((s, i, a) => (
              <div key={i} style={{
                padding: 16, borderBottom: i < a.length - 1 ? `1px solid ${FG.line}` : 'none',
              }}>
                <div style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>SWAP</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                  <span style={{ textDecoration: 'line-through', color: FG.dim }}>{s.from}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  <span style={{ fontWeight: 700 }}>{s.to}</span>
                </div>
                <div style={{ fontSize: 11, color: FG.mid, marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{s.d}</div>
              </div>
            ))}
          </FCard>
        </div>
      </div>
    </WebShell>
  );
}

// ─── WEB · PROGRESS ────────────────────────────────────────────
function WebProgress() {
  const trend = [78.2, 78.0, 77.8, 78.1, 77.5, 77.2, 77.0, 76.8, 76.9, 76.5, 76.2, 75.9];
  const benchTrend = [165, 170, 170, 175, 175, 180, 180, 185];
  return (
    <WebShell active="progress" title="Progress" subtitle="12 weeks · gain phase">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {['Body', 'Lifts', 'Photos', 'Macros'].map((t, i) => (
          <button key={t} style={{
            padding: '8px 16px', borderRadius: 8,
            background: i === 0 ? FG.bg2 : 'transparent',
            border: `1px solid ${i === 0 ? FG.lineStrong : 'transparent'}`,
            color: i === 0 ? FG.text : FG.mid,
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
          }}>{t}</button>
        ))}
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { k: 'WEIGHT', v: '75.9', u: 'kg', d: '−2.3', tone: 'ok' },
          { k: 'BODY FAT', v: '14.2', u: '%', d: '−1.8', tone: 'ok' },
          { k: 'LEAN MASS', v: '65.1', u: 'kg', d: '+0.4', tone: 'ok' },
          { k: 'BMI', v: '23.8', u: '', d: 'normal', tone: 'neutral' },
        ].map((s, i) => (
          <FCard key={i} padding={16}>
            <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>{s.k}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <span className="num" style={{ fontSize: 28 }}>{s.v}</span>
              <span style={{ color: FG.mid, fontSize: 12 }}>{s.u}</span>
            </div>
            <div style={{ fontSize: 11, marginTop: 4, color: s.tone === 'ok' ? FG.ok : FG.mid, fontFamily: 'JetBrains Mono, monospace' }}>{s.d}</div>
          </FCard>
        ))}
      </div>

      {/* Two charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
        <FCard padding={20}>
          <FSectionHead kicker="BODY WEIGHT" title="12 week trend"/>
          <FSparkline data={trend} w={520} h={150}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
            <span>78.2 kg · FEB 14</span><span>75.9 kg · MAY 12</span>
          </div>
        </FCard>
        <FCard padding={20}>
          <FSectionHead kicker="BENCH PRESS · 1RM EST" title="Lift progression"/>
          <FSparkline data={benchTrend} w={520} h={150}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
            <span>165 lb · 8 WK AGO</span><span style={{ color: FG.accent }}>185 lb · TODAY</span>
          </div>
        </FCard>
      </div>

      {/* Photo timeline */}
      <FCard padding={20}>
        <FSectionHead kicker="PHOTO TIMELINE" title="Front · 12 weeks compare" action="Upload new"/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { l: 'WEEK 0', t: 'FEB 14', w: '78.2 kg' },
            { l: 'WEEK 4', t: 'MAR 14', w: '77.5 kg' },
            { l: 'WEEK 8', t: 'APR 11', w: '76.8 kg' },
            { l: 'WEEK 12', t: 'MAY 12', w: '75.9 kg', cur: true },
          ].map((p, i) => (
            <div key={i}>
              <div className="imgph" data-label={`// progress · ${p.l.toLowerCase()}`} data-tone={p.cur ? 'warm' : ''} style={{
                aspectRatio: '3 / 4', borderRadius: 12, position: 'relative',
                border: p.cur ? '1px solid rgba(249,115,22,0.4)' : 'none',
              }}>
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: FG.text,
                  background: 'rgba(0,0,0,0.5)', padding: '3px 7px', borderRadius: 4, letterSpacing: '0.1em',
                }}>{p.l}</div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>{p.t}</span>
                <span style={{ fontSize: 11, color: p.cur ? FG.accent : FG.text, fontFamily: 'JetBrains Mono, monospace' }}>{p.w}</span>
              </div>
            </div>
          ))}
        </div>
      </FCard>
    </WebShell>
  );
}

// ─── WEB · BADGES / GAMIFICATION ───────────────────────────────
function WebBadges() {
  const badges = [
    { name: 'First Lift', e: '⚒', earned: true, date: 'Mar 4', xp: 10 },
    { name: 'Week Streak', e: '🔥', earned: true, date: 'Mar 11', xp: 50 },
    { name: 'PR Hunter', e: '↗', earned: true, date: 'Mar 22', xp: 100 },
    { name: 'Macro Master', e: '◷', earned: true, date: 'Apr 2', xp: 75 },
    { name: 'Iron Forger', e: '⚙', earned: true, date: 'May 12', xp: 250, rare: true, glow: true },
    { name: 'Volume King', e: '◬', earned: false, xp: 200 },
    { name: 'Photo Diary', e: '◐', earned: false, xp: 100 },
    { name: '100 Lifts', e: '✦', earned: false, xp: 150 },
    { name: 'Naturally Built', e: '✺', earned: false, xp: 500, rare: true },
    { name: 'Sleep Warrior', e: '☾', earned: false, xp: 75 },
  ];
  const ranking = [
    { rank: 1, name: 'Ana M.', xp: 4280, you: false },
    { rank: 2, name: 'Carlos S.', xp: 3920, you: false },
    { rank: 3, name: 'Diego R.', xp: 2140, you: true },
    { rank: 4, name: 'Marina K.', xp: 1980, you: false },
    { rank: 5, name: 'Joao P.', xp: 1820, you: false },
  ];
  return (
    <WebShell active="badges" title="Forge" subtitle="Levels · badges · weekly missions">
      {/* Level header */}
      <div className="heat" style={{
        borderRadius: 18, padding: 24, border: `1px solid ${FG.line}`,
        position: 'relative', overflow: 'hidden', marginBottom: 18,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <FRing value={0.68} size={104} stroke={9} label="68%" sub="LVL 7"/>
            <div>
              <div style={{ fontSize: 11, color: FG.accent, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>LEVEL 7 · IRON FORGER</div>
              <h2 style={{ fontSize: 32, marginTop: 6 }}>2,140 <span style={{ color: FG.dim, fontWeight: 500, fontSize: 18 }}>XP</span></h2>
              <div style={{ fontSize: 13, color: FG.mid, marginTop: 4 }}>860 XP to reach Steel Forger · LVL 8</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { v: '14', l: 'STREAK' },
              { v: '11', l: 'BADGES' },
              { v: '23', l: 'PRs' },
            ].map(s => (
              <div key={s.l} style={{
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${FG.line}`,
                borderRadius: 12, padding: '14px 22px', textAlign: 'center', minWidth: 80,
              }}>
                <div className="num" style={{ fontSize: 24 }}>{s.v}</div>
                <div style={{ fontSize: 9, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        {/* Badge grid */}
        <div>
          <FSectionHead kicker="11 EARNED · 4 LOCKED" title="Badges"/>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {badges.map((b, i) => (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 16, padding: 14,
                background: b.earned ? (b.rare ? 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(240,184,110,0.06))' : FG.bg1) : 'rgba(255,255,255,0.02)',
                border: b.earned ? (b.rare ? '1px solid rgba(249,115,22,0.4)' : `1px solid ${FG.line}`) : `1px dashed ${FG.line}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden', opacity: b.earned ? 1 : 0.45,
              }}>
                {b.glow && <div style={{
                  position: 'absolute', inset: 0,
                  background: 'radial-gradient(circle, rgba(249,115,22,0.3), transparent 70%)',
                }}/>}
                <div style={{ fontSize: 32, position: 'relative', filter: b.earned ? 'none' : 'grayscale(1)', marginBottom: 8 }}>{b.e}</div>
                <div style={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: b.earned ? FG.text : FG.dim, textAlign: 'center', position: 'relative' }}>{b.name}</div>
                <div style={{ fontSize: 9, color: b.earned ? FG.accent : FG.dim, fontFamily: 'JetBrains Mono, monospace', marginTop: 4, position: 'relative' }}>
                  {b.earned ? b.date : `+${b.xp} XP`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking + mission */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FCard padding={18}>
            <FSectionHead kicker="WEEKLY MISSION" title="3 PRs in 7 days"/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <FStat value="2" unit="/ 3" size="sm"/>
              <FBadge tone="warn">+150 XP</FBadge>
            </div>
            <FProgress value={0.66} color={FG.warn}/>
            <div style={{ fontSize: 11, color: FG.dim, marginTop: 8, fontFamily: 'Inter, sans-serif' }}>3 days left · keep pushing</div>
          </FCard>

          <FCard padding={18}>
            <FSectionHead kicker="THIS MONTH" title="Forge ranking"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ranking.map(r => (
                <div key={r.rank} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8,
                  background: r.you ? 'rgba(249,115,22,0.1)' : 'transparent',
                  border: r.you ? '1px solid rgba(249,115,22,0.25)' : '1px solid transparent',
                }}>
                  <span className="num" style={{
                    width: 22, fontSize: 13,
                    color: r.rank === 1 ? FG.accent : r.you ? FG.accent : FG.mid,
                  }}>{r.rank}</span>
                  <div className="imgph" style={{ width: 24, height: 24, borderRadius: 8 }}/>
                  <span style={{ flex: 1, fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: r.you ? 700 : 500, color: r.you ? FG.text : FG.mid }}>
                    {r.name}{r.you && <span style={{ color: FG.accent, marginLeft: 6, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>YOU</span>}
                  </span>
                  <span className="mono" style={{ fontSize: 12, color: r.you ? FG.accent : FG.text }}>{r.xp.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </FCard>
        </div>
      </div>
    </WebShell>
  );
}

// ─── WEB · LIBRARY ─────────────────────────────────────────────
function WebLibrary() {
  const exercises = [
    { name: 'Barbell Bench Press', m: 'Chest', eq: 'Barbell', diff: 'Intermediate', logged: '8.2k', e: '⚒', vid: true },
    { name: 'Conventional Deadlift', m: 'Back · Legs', eq: 'Barbell', diff: 'Advanced', logged: '6.4k', e: '◧', vid: true },
    { name: 'Back Squat', m: 'Legs', eq: 'Barbell', diff: 'Intermediate', logged: '7.1k', e: '⚙', vid: true },
    { name: 'Pull-up', m: 'Back', eq: 'Bodyweight', diff: 'Intermediate', logged: '4.8k', e: '◬', vid: true },
    { name: 'Overhead Press', m: 'Shoulders', eq: 'Barbell', diff: 'Intermediate', logged: '3.2k', e: '◯', vid: true },
    { name: 'Romanian Deadlift', m: 'Hamstrings', eq: 'Barbell', diff: 'Intermediate', logged: '2.9k', e: '◫', vid: true },
    { name: 'Bulgarian Split Squat', m: 'Legs', eq: 'Dumbbell', diff: 'Intermediate', logged: '2.1k', e: '◭', vid: true },
    { name: 'Cable Row', m: 'Back', eq: 'Cable', diff: 'Beginner', logged: '5.0k', e: '◰', vid: true },
  ];
  return (
    <WebShell active="library" title="Library" subtitle="650 lifts · 1,800 foods · 240 recipes"
      action={<>
        <FButton variant="ghost" size="sm">Export</FButton>
        <FButton size="sm">+ Custom lift</FButton>
      </>}>

      {/* Section toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {['Lifts', 'Foods', 'Recipes', 'Cardio'].map((t, i) => (
          <button key={t} style={{
            padding: '8px 18px', borderRadius: 8,
            background: i === 0 ? FG.accent : 'transparent',
            border: `1px solid ${i === 0 ? FG.accent : FG.line}`,
            color: i === 0 ? '#1a0a00' : FG.mid,
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
          }}>{t}</button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', alignSelf: 'center', marginRight: 4 }}>FILTERS:</span>
        {[
          { l: 'Muscle: All', on: false },
          { l: 'Equipment: Barbell', on: true },
          { l: 'Difficulty: Any', on: false },
          { l: 'Sort: Most logged', on: false },
        ].map((f, i) => (
          <button key={i} style={{
            padding: '6px 12px', borderRadius: 8,
            background: f.on ? 'rgba(249,115,22,0.12)' : FG.bg1,
            border: `1px solid ${f.on ? 'rgba(249,115,22,0.3)' : FG.line}`,
            color: f.on ? FG.accent : FG.mid,
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {f.l}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        ))}
      </div>

      {/* Grid of lift cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {exercises.map((ex, i) => (
          <FCard key={i} padding={0} style={{ overflow: 'hidden' }}>
            <div className="imgph" data-tone={i === 0 ? 'warm' : ''} style={{
              aspectRatio: '16 / 10', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 44, opacity: 0.6 }}>{ex.e}</span>
              {ex.vid && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                  padding: '3px 8px', borderRadius: 6,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                  color: FG.text, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <svg width="8" height="8" viewBox="0 0 8 8"><path d="M2 1l5 3-5 3z" fill="currentColor"/></svg>
                  VIDEO
                </div>
              )}
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700 }}>{ex.name}</div>
              <div style={{ fontSize: 11, color: FG.accent, marginTop: 3, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{ex.m}</div>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
                <span>{ex.eq.toUpperCase()}</span>
                <span>{ex.logged} LOGGED</span>
              </div>
            </div>
          </FCard>
        ))}
      </div>
    </WebShell>
  );
}

Object.assign(window, {
  WebDashboard, WebWorkout, WebDiet, WebProgress, WebBadges, WebLibrary,
});
