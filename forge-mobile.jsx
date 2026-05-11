// Forge mobile screens — 9 screens. Renders inside iOS device frames.
// Pure presentational; no real state. Uses FG colors and shared atoms.

// ─── 1. ONBOARDING ─────────────────────────────────────────────
function MobileOnboarding() {
  return (
    <div className="forge" style={{ width: '100%', height: '100%', background: FG.bg0, position: 'relative', overflow: 'hidden' }}>
      {/* ambient heat from below */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(80% 50% at 50% 110%, rgba(249,115,22,0.45) 0%, transparent 60%)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', top: 70, left: 24, right: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: FG.dim, letterSpacing: '0.16em' }}>
          STEP 1 / 5
        </span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: FG.accent, letterSpacing: '0.12em' }}>
          SKIP
        </span>
      </div>

      {/* Logo + tagline, centered upper */}
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center', padding: '0 32px' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <ForgeLogo size={44}/>
          <div style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 32, fontWeight: 700,
            letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 24, textWrap: 'balance',
          }}>
            Forge your<br/>
            <span style={{ color: FG.accent }}>natural body.</span>
          </div>
          <p style={{
            color: FG.mid, fontSize: 15, lineHeight: 1.5, maxWidth: 280, margin: '4px auto 0',
            fontFamily: 'Inter, sans-serif',
          }}>
            Train, eat, and track progress without shortcuts. Built for lifters who do it clean.
          </p>
        </div>
      </div>

      {/* Feature bullets */}
      <div style={{ position: 'absolute', bottom: 220, left: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { t: 'Plans tuned to natural recovery', i: '⚒' },
          { t: 'Macros that match your build phase', i: '◷' },
          { t: 'Progress photos + lift PRs in one feed', i: '↗' },
        ].map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 14,
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${FG.line}`,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(249,115,22,0.14)', color: FG.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 700,
            }}>{f.i}</div>
            <span style={{ fontSize: 14, color: FG.text, fontFamily: 'Inter, sans-serif' }}>{f.t}</span>
          </div>
        ))}
      </div>

      {/* CTA stack */}
      <div style={{ position: 'absolute', bottom: 50, left: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FButton size="lg" style={{ width: '100%' }}>
          Start training →
        </FButton>
        <div style={{ display: 'flex', gap: 10 }}>
          <FButton variant="ghost" size="md" style={{ flex: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v3.8h5.35c-.5 2.4-2.55 3.8-5.35 3.8-3.2 0-5.8-2.6-5.8-5.7s2.6-5.7 5.8-5.7c1.45 0 2.75.5 3.75 1.45l2.7-2.7C16.85 4.4 14.6 3.5 12 3.5 7 3.5 3 7.5 3 12.5S7 21.5 12 21.5c5.2 0 8.6-3.65 8.6-8.8 0-.55-.05-1.1-.25-1.6z"/></svg>
            Google
          </FButton>
          <FButton variant="ghost" size="md" style={{ flex: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M16.46 12.6c0-2.5 2.05-3.7 2.13-3.78-1.16-1.7-2.97-1.93-3.62-1.96-1.55-.16-3 .9-3.79.9-.78 0-1.97-.87-3.24-.85-1.67.03-3.21.97-4.07 2.46-1.74 3.01-.45 7.46 1.25 9.9.83 1.2 1.81 2.55 3.1 2.5 1.25-.05 1.72-.81 3.23-.81 1.5 0 1.94.81 3.25.78 1.34-.03 2.19-1.22 3-2.43.94-1.4 1.34-2.74 1.36-2.81-.03-.02-2.6-1-2.6-3.93zm-2.5-7.21c.69-.83 1.15-1.99 1.02-3.14-.99.04-2.18.66-2.89 1.5-.64.73-1.2 1.9-1.05 3.04 1.1.08 2.23-.56 2.92-1.4z"/></svg>
            Apple
          </FButton>
        </div>
        <div style={{ textAlign: 'center', color: FG.dim, fontSize: 12, marginTop: 6 }}>
          Have an account? <span style={{ color: FG.accent, fontWeight: 600 }}>Log in</span>
        </div>
      </div>

      {/* Progress ticks */}
      <div style={{ position: 'absolute', top: 102, left: 24, right: 24, display: 'flex', gap: 4 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i === 0 ? FG.accent : 'rgba(255,255,255,0.08)',
          }}/>
        ))}
      </div>
    </div>
  );
}

// ─── 2. DASHBOARD ─────────────────────────────────────────────
function MobileDashboard() {
  return (
    <FMobileScreen padTop={56} padBottom={90}>
      {/* Header */}
      <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13, color: FG.dim, fontFamily: 'Inter, sans-serif' }}>Tuesday, May 12</div>
          <h1 style={{ fontSize: 26, marginTop: 2, letterSpacing: '-0.03em' }}>Hey, Diego.</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: FG.bg1, border: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/></svg>
            <div style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 4, background: FG.accent, boxShadow: '0 0 8px rgba(249,115,22,0.7)' }}/>
          </div>
          <div className="imgph" style={{ width: 38, height: 38, borderRadius: 12 }}/>
        </div>
      </div>

      {/* Streak + level row */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <FCard padding={16} style={{ position: 'relative', overflow: 'hidden' }} elevated>
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: 100,
            background: 'radial-gradient(circle, rgba(249,115,22,0.25), transparent 70%)',
          }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>🔥</span>
                <FStat value="14" unit="day streak" size="md"/>
              </div>
              <div style={{ fontSize: 12, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>LVL 7 · IRON FORGER</div>
            </div>
            <FRing value={0.68} size={64} stroke={5} label="68%" sub="XP"/>
          </div>
          <div style={{ marginTop: 12 }}>
            <FProgress value={0.68}/>
          </div>
        </FCard>
      </div>

      {/* Today's workout — primary CTA card */}
      <div style={{ padding: '0 20px', marginBottom: 12 }}>
        <FSectionHead kicker="TODAY · PUSH DAY" title="Chest & Triceps" action="View →"/>
        <div style={{
          background: FG.bg1, borderRadius: 18, border: `1px solid ${FG.line}`,
          overflow: 'hidden',
        }}>
          <div className="imgph" data-label="// hero · barbell bench" data-tone="warm" style={{ height: 120 }}>
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
              <FBadge tone="accent">5 lifts</FBadge>
              <FBadge tone="neutral">≈ 52 min</FBadge>
            </div>
          </div>
          <div style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 16 }}>Bench · Incline · Skullcrushers</div>
              <div style={{ fontSize: 12, color: FG.dim, marginTop: 2 }}>Last: +5lb on bench · 6 days ago</div>
            </div>
            <FButton size="sm">Start</FButton>
          </div>
        </div>
      </div>

      {/* Macros card */}
      <div style={{ padding: '0 20px', marginBottom: 12 }}>
        <FCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Today's fuel</div>
              <FStat value="1,820" unit="/ 2,650 kcal" size="lg"/>
            </div>
            <FRing value={0.69} size={54} stroke={5} color={FG.accent} label="69%"/>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { l: 'Protein', v: 142, t: 180, c: FG.accent },
              { l: 'Carbs',   v: 210, t: 320, c: FG.warn },
              { l: 'Fat',     v: 58,  t: 80,  c: FG.ok },
            ].map(m => (
              <div key={m.l} style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: FG.dim, marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>{m.l}</div>
                <FProgress value={m.v / m.t} color={m.c} height={4}/>
                <div style={{ fontSize: 12, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{m.v}<span style={{ color: FG.dim }}>/{m.t}g</span></div>
              </div>
            ))}
          </div>
        </FCard>
      </div>

      {/* Recovery card */}
      <div style={{ padding: '0 20px', marginBottom: 12 }}>
        <FCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(94,209,154,0.12)', border: '1px solid rgba(94,209,154,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: FG.ok,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Recovery</span>
                <span style={{ fontSize: 12, color: FG.ok, fontFamily: 'JetBrains Mono, monospace' }}>READY</span>
              </div>
              <div style={{ fontSize: 12, color: FG.mid, marginTop: 2 }}>7h 42m sleep · low soreness</div>
            </div>
          </div>
        </FCard>
      </div>

      <FTabBar active="home"/>

      {/* FAB */}
      <div style={{
        position: 'absolute', bottom: 92, right: 18,
        width: 56, height: 56, borderRadius: 28,
        background: FG.accent,
        boxShadow: '0 12px 30px rgba(249,115,22,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a0a00" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </div>
    </FMobileScreen>
  );
}

// ─── 3. WORKOUT LOG ────────────────────────────────────────────
function MobileWorkout() {
  const exercises = [
    { name: 'Barbell Bench Press', sets: '4 × 6-8', target: '185 lb', done: 4, total: 4 },
    { name: 'Incline Dumbbell Press', sets: '3 × 8-10', target: '70 lb', done: 3, total: 3 },
    { name: 'Cable Fly', sets: '3 × 12', target: '40 lb', done: 2, total: 3 },
    { name: 'Skullcrushers', sets: '3 × 10', target: '60 lb', done: 0, total: 3 },
    { name: 'Cable Pushdown', sets: '3 × 12', target: '50 lb', done: 0, total: 3 },
  ];
  const days = ['M','T','W','T','F','S','S'];
  return (
    <FMobileScreen padTop={56} padBottom={100}>
      {/* Header */}
      <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <button style={{ width: 36, height: 36, borderRadius: 18, background: FG.bg1, border: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>WEEK 6 · PPL</div>
          <div style={{ fontSize: 16, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>Push Day</div>
        </div>
        <button style={{ width: 36, height: 36, borderRadius: 18, background: FG.bg1, border: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: FG.mid }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
        </button>
      </div>

      {/* Day strip */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px', marginBottom: 16, overflowX: 'auto' }}>
        {days.map((d, i) => {
          const today = i === 1;
          const done = i === 0;
          return (
            <div key={i} style={{
              flex: 1, padding: '10px 0', borderRadius: 12, textAlign: 'center',
              background: today ? FG.accent : FG.bg1,
              border: today ? 'none' : `1px solid ${FG.line}`,
              color: today ? '#1a0a00' : (done ? FG.ok : FG.mid),
              fontFamily: 'DM Sans, sans-serif',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>{d}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{10+i}</div>
              {done && <div style={{ width: 4, height: 4, borderRadius: 2, background: FG.ok, margin: '4px auto 0' }}/>}
            </div>
          );
        })}
      </div>

      {/* Active timer */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(249,115,22,0.06))',
          border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: 18, padding: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, color: FG.accent, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>SESSION ACTIVE</div>
            <div className="num" style={{ fontSize: 28, color: FG.text, marginTop: 2 }}>32:14</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>VOLUME</div>
            <div className="num" style={{ fontSize: 18, color: FG.text }}>8,420 lb</div>
          </div>
          <button style={{
            width: 44, height: 44, borderRadius: 22,
            background: FG.accent, border: 'none',
            boxShadow: '0 6px 16px rgba(249,115,22,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a0a00"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
          </button>
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {exercises.map((ex, i) => {
          const complete = ex.done === ex.total;
          const active = i === 2;
          return (
            <div key={i} style={{
              background: FG.bg1,
              border: `1px solid ${active ? 'rgba(249,115,22,0.4)' : FG.line}`,
              borderRadius: 14, padding: 14,
              opacity: complete ? 0.6 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FCheck checked={complete}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 600, textDecoration: complete ? 'line-through' : 'none' }}>{ex.name}</div>
                  <div style={{ fontSize: 12, color: FG.dim, marginTop: 2, display: 'flex', gap: 8 }}>
                    <span>{ex.sets}</span>
                    <span style={{ color: FG.line }}>·</span>
                    <span style={{ color: FG.accent, fontFamily: 'JetBrains Mono, monospace' }}>{ex.target}</span>
                  </div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: FG.mid }}>
                  {ex.done}/{ex.total}
                </div>
              </div>
              {active && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${FG.line}`, display: 'flex', gap: 6 }}>
                  {[1,2,3].map(s => (
                    <div key={s} style={{
                      flex: 1, padding: '8px 6px', borderRadius: 10,
                      background: s <= ex.done ? 'rgba(94,209,154,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${s <= ex.done ? 'rgba(94,209,154,0.25)' : FG.line}`,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 9, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>SET {s}</div>
                      <div className="num" style={{ fontSize: 13, marginTop: 2 }}>{s <= ex.done ? '12 × 40' : '— · —'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <button style={{
          padding: 14, borderRadius: 14, marginTop: 4,
          background: 'transparent', border: `1.5px dashed ${FG.line}`,
          color: FG.mid, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add exercise
        </button>
      </div>

      <FTabBar active="lift"/>
    </FMobileScreen>
  );
}

// ─── 4. DIET / MEALS ───────────────────────────────────────────
function MobileDiet() {
  const meals = [
    { name: 'Breakfast', time: '08:30', items: 'Oats · whey · banana', kcal: 540, p: 38, status: 'done' },
    { name: 'Lunch',     time: '13:00', items: 'Chicken rice bowl', kcal: 720, p: 55, status: 'done' },
    { name: 'Snack',     time: '16:30', items: 'Greek yogurt + nuts', kcal: 320, p: 22, status: 'pending' },
    { name: 'Dinner',    time: '20:00', items: '— Tap to plan', kcal: 0, p: 0, status: 'planned' },
  ];
  return (
    <FMobileScreen padTop={56} padBottom={100}>
      <div style={{ padding: '0 20px 14px' }}>
        <h1 style={{ fontSize: 28 }}>Today's plate</h1>
        <div style={{ fontSize: 13, color: FG.dim, marginTop: 2 }}>2,650 kcal target · cut phase</div>
      </div>

      {/* Calorie ring + macros */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <FCard padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <FRing value={0.69} size={108} stroke={9} label="1,820" sub="of 2,650"/>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { l: 'Protein', v: 142, t: 180, c: FG.accent },
                { l: 'Carbs',   v: 210, t: 320, c: FG.warn },
                { l: 'Fat',     v: 58,  t: 80,  c: FG.ok },
              ].map(m => (
                <div key={m.l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: FG.mid }}>{m.l}</span>
                    <span className="mono" style={{ color: FG.text, fontSize: 11 }}>{m.v}/{m.t}g</span>
                  </div>
                  <FProgress value={m.v/m.t} color={m.c} height={4}/>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: 'rgba(240,184,110,0.08)', border: '1px solid rgba(240,184,110,0.18)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 16 }}>💧</span>
            <span style={{ fontSize: 12, color: FG.warn, fontFamily: 'Inter, sans-serif' }}>Drink water — 1.2 / 3.0L logged</span>
          </div>
        </FCard>
      </div>

      {/* Meals */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {meals.map((m, i) => {
          const done = m.status === 'done';
          const planned = m.status === 'planned';
          return (
            <div key={i} style={{
              background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`,
              padding: 14, display: 'flex', gap: 12, alignItems: 'center',
              opacity: planned ? 0.65 : 1,
            }}>
              <div className="imgph" data-tone={done ? 'warm' : ''} style={{
                width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 22 }}>{done ? '🍳' : planned ? '○' : '🥗'}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 600 }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 12, color: FG.mid, marginTop: 2 }}>{m.items}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                  {!planned && (
                    <>
                      <FBadge tone={done ? 'ok' : 'warn'}>{m.kcal} kcal</FBadge>
                      <FBadge tone="accent">{m.p}g P</FBadge>
                    </>
                  )}
                  {planned && <span style={{ fontSize: 12, color: FG.accent, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>+ Add foods</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <FTabBar active="eat"/>
      <div style={{
        position: 'absolute', bottom: 92, right: 18,
        width: 56, height: 56, borderRadius: 28,
        background: FG.accent, boxShadow: '0 12px 30px rgba(249,115,22,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a0a00" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </div>
    </FMobileScreen>
  );
}

// ─── 5. PROGRESS ───────────────────────────────────────────────
function MobileProgress() {
  const trend = [78.2, 78.0, 77.8, 78.1, 77.5, 77.2, 77.0, 76.8, 76.9, 76.5, 76.2, 75.9];
  return (
    <FMobileScreen padTop={56} padBottom={100}>
      <div style={{ padding: '0 20px 14px' }}>
        <h1 style={{ fontSize: 28 }}>Progress</h1>
        <div style={{ fontSize: 13, color: FG.dim, marginTop: 2 }}>12 weeks in · gain phase</div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', gap: 6 }}>
        {['Body', 'Lifts', 'Photos'].map((t, i) => (
          <button key={t} style={{
            flex: 1, padding: '10px 0', borderRadius: 10,
            background: i === 0 ? FG.bg2 : 'transparent',
            border: `1px solid ${i === 0 ? FG.lineStrong : FG.line}`,
            color: i === 0 ? FG.text : FG.mid,
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
          }}>{t}</button>
        ))}
      </div>

      {/* Headline weight */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <FCard padding={18}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Body weight · 12W</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span className="num" style={{ fontSize: 40, letterSpacing: '-0.03em' }}>75.9</span>
                <span style={{ color: FG.mid }}>kg</span>
                <FBadge tone="ok" style={{ marginLeft: 6 }}>−2.3 kg</FBadge>
              </div>
            </div>
          </div>
          <FSparkline data={trend} w={324} h={70}/>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
            <span>FEB 14</span>
            <span>MAY 12</span>
          </div>
        </FCard>
      </div>

      {/* Measures grid */}
      <div style={{ padding: '0 20px', marginBottom: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { l: 'Chest',    v: '104', d: '+1.5', tone: 'ok' },
          { l: 'Arms',     v: '38.4', d: '+0.8', tone: 'ok' },
          { l: 'Waist',    v: '79.0', d: '−1.2', tone: 'ok' },
          { l: 'Body fat', v: '14.2', d: '−1.8', tone: 'ok' },
        ].map(m => (
          <FCard key={m.l} padding={14}>
            <div style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{m.l}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
              <span className="num" style={{ fontSize: 22 }}>{m.v}</span>
              <span style={{ fontSize: 11, color: FG.mid }}>{m.l === 'Body fat' ? '%' : 'cm'}</span>
            </div>
            <div style={{ fontSize: 11, color: FG.ok, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{m.d}</div>
          </FCard>
        ))}
      </div>

      {/* Photo compare */}
      <div style={{ padding: '0 20px' }}>
        <FSectionHead kicker="PHOTO COMPARE" title="Front · 12 weeks" action="View all"/>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { l: 'WEEK 0', t: 'FEB 14' },
            { l: 'WEEK 12', t: 'MAY 12' },
          ].map((p, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div className="imgph" data-label={`// progress · ${p.l.toLowerCase()}`} data-tone={i === 1 ? 'warm' : ''} style={{
                aspectRatio: '3 / 4', borderRadius: 14, position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: FG.text,
                  background: 'rgba(0,0,0,0.4)', padding: '3px 6px', borderRadius: 4, letterSpacing: '0.1em',
                }}>{p.l}</div>
                <div style={{
                  position: 'absolute', bottom: 8, right: 8,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: FG.dim,
                }}>{p.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FTabBar active="progress"/>
    </FMobileScreen>
  );
}

// ─── 6. PROFILE ────────────────────────────────────────────────
function MobileProfile() {
  return (
    <FMobileScreen padTop={56} padBottom={100}>
      {/* Header card with avatar */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div className="heat" style={{
          borderRadius: 22, padding: 20,
          border: `1px solid ${FG.line}`,
          display: 'flex', alignItems: 'center', gap: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="imgph" data-tone="warm" style={{
            width: 74, height: 74, borderRadius: 22,
            border: '2px solid rgba(249,115,22,0.5)',
          }}/>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22 }}>Diego Rocha</h1>
            <div style={{ fontSize: 12, color: FG.mid, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>@diego.lifts · joined Mar 2025</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <FBadge tone="accent" icon={<span style={{ marginRight: 2 }}>⚒</span>}>LVL 7</FBadge>
              <FBadge tone="ok">14 day streak</FBadge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ padding: '0 20px', marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { l: 'WORKOUTS', v: '142' },
          { l: 'PR LIFTS',  v: '23' },
          { l: 'BADGES',   v: '11' },
        ].map(s => (
          <div key={s.l} style={{
            background: FG.bg1, border: `1px solid ${FG.line}`, borderRadius: 12,
            padding: 12, textAlign: 'center',
          }}>
            <div className="num" style={{ fontSize: 22 }}>{s.v}</div>
            <div style={{ fontSize: 9, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Lumen banner */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{
          borderRadius: 18, padding: 16,
          background: 'linear-gradient(135deg, #1A2233, #0B0F14)',
          border: '1px solid rgba(249,115,22,0.3)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 120, height: 120, borderRadius: 60,
            background: 'radial-gradient(circle, rgba(249,115,22,0.4), transparent 70%)',
          }}/>
          <FBadge tone="accent" style={{ marginBottom: 8 }}>COMING SOON</FBadge>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            Connect Lumen
          </div>
          <div style={{ fontSize: 12, color: FG.mid, marginBottom: 12, lineHeight: 1.5, maxWidth: 240 }}>
            Auto-detect your metabolic state and tune macros to your daily fuel.
          </div>
          <FButton variant="soft" size="sm">Notify me</FButton>
        </div>
      </div>

      {/* Settings list */}
      <div style={{ padding: '0 20px' }}>
        <FSectionHead kicker="ACCOUNT" title="Settings"/>
        <div style={{ background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`, overflow: 'hidden' }}>
          {[
            { l: 'Personal info', sub: 'Age, height, weight' },
            { l: 'Goals', sub: 'Currently: gain, +0.4 kg/wk' },
            { l: 'Notifications', sub: '3 reminders active' },
            { l: 'Units & language', sub: 'kg · cm · English' },
            { l: 'Connected devices', sub: 'Apple Health · Strava' },
          ].map((r, i, a) => (
            <div key={r.l} style={{
              padding: '14px 16px',
              borderBottom: i < a.length - 1 ? `1px solid ${FG.line}` : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{r.l}</div>
                <div style={{ fontSize: 12, color: FG.dim, marginTop: 2 }}>{r.sub}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
            </div>
          ))}
        </div>
      </div>

      <FTabBar active="profile"/>
    </FMobileScreen>
  );
}

// ─── 7. GAMIFICATION / BADGES ──────────────────────────────────
function MobileBadges() {
  const badges = [
    { name: 'First Lift', e: '⚒', earned: true, glow: true },
    { name: 'Week Streak', e: '🔥', earned: true },
    { name: 'PR Hunter', e: '↗', earned: true },
    { name: 'Macro Master', e: '◷', earned: true },
    { name: 'Iron Forger', e: '⚙', earned: true, rare: true },
    { name: 'Volume King', e: '◬', earned: false },
    { name: 'Photo Diary', e: '◐', earned: false },
    { name: '100 Lifts', e: '✦', earned: false },
    { name: 'Naturally Built', e: '✺', earned: false, rare: true },
  ];
  return (
    <FMobileScreen padTop={56} padBottom={100}>
      <div style={{ padding: '0 20px 14px' }}>
        <h1 style={{ fontSize: 28 }}>Forge</h1>
        <div style={{ fontSize: 13, color: FG.dim, marginTop: 2 }}>Badges, levels, missions</div>
      </div>

      {/* Level progress */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div className="heat" style={{
          borderRadius: 18, padding: 18, border: `1px solid ${FG.line}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: FG.accent, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>LEVEL 7</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 22, fontWeight: 700, marginTop: 2 }}>Iron Forger</div>
            </div>
            <FRing value={0.68} size={64} stroke={5} label="68%"/>
          </div>
          <FProgress value={0.68}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: FG.mid, fontFamily: 'JetBrains Mono, monospace' }}>
            <span>2,140 XP</span>
            <span>· 860 to LVL 8 · Steel Forger</span>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <FSectionHead kicker="WEEKLY MISSION" title="3 PRs in 7 days"/>
        <FCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <FStat value="2" unit="/ 3" size="sm" label="PROGRESS"/>
            <FBadge tone="warn">+150 XP</FBadge>
          </div>
          <FProgress value={0.66} color={FG.warn}/>
          <div style={{ fontSize: 12, color: FG.dim, marginTop: 8 }}>3 days left · keep pushing</div>
        </FCard>
      </div>

      {/* Badge grid */}
      <div style={{ padding: '0 20px' }}>
        <FSectionHead kicker="11 EARNED" title="Badges"/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {badges.map((b, i) => (
            <div key={i} style={{
              aspectRatio: '1', borderRadius: 16,
              background: b.earned ? (b.rare ? 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(240,184,110,0.1))' : FG.bg1) : 'rgba(255,255,255,0.02)',
              border: b.earned ? (b.rare ? '1px solid rgba(249,115,22,0.4)' : `1px solid ${FG.line}`) : `1px dashed ${FG.line}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 6, position: 'relative', overflow: 'hidden',
              opacity: b.earned ? 1 : 0.4,
            }}>
              {b.glow && <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle, rgba(249,115,22,0.25), transparent 70%)',
              }}/>}
              <div style={{ fontSize: 28, position: 'relative', filter: b.earned ? 'none' : 'grayscale(1)' }}>{b.e}</div>
              <div style={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: b.earned ? FG.text : FG.dim, textAlign: 'center', position: 'relative' }}>{b.name}</div>
            </div>
          ))}
        </div>
      </div>

      <FTabBar active="profile"/>
    </FMobileScreen>
  );
}

// ─── 8. NOTIFICATIONS ──────────────────────────────────────────
function MobileNotifications() {
  const notifs = [
    { kind: 'badge', t: 'Badge unlocked', sub: 'Iron Forger — LVL 7 reached', time: '2m', icon: '⚒', tone: 'accent', glow: true },
    { kind: 'workout', t: 'Workout streak +1', sub: 'Day 14 — keep the fire alive', time: '1h', icon: '🔥', tone: 'warn' },
    { kind: 'meal', t: 'Snack logged', sub: 'Greek yogurt + nuts · 320 kcal', time: '3h', icon: '🥗', tone: 'ok' },
    { kind: 'meal', t: 'Dinner reminder', sub: 'You\'re 830 kcal short — plan meal', time: '5h', icon: '◷', tone: 'warn' },
    { kind: 'pr',   t: 'New PR detected', sub: 'Bench: 185 lb × 8 (+5 lb)', time: 'yesterday', icon: '↗', tone: 'accent' },
    { kind: 'rest', t: 'Rest day reminder', sub: 'Tomorrow is a planned rest', time: 'yesterday', icon: '◐', tone: 'neutral' },
  ];
  return (
    <FMobileScreen padTop={56} padBottom={100}>
      <div style={{ padding: '0 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h1 style={{ fontSize: 28 }}>Activity</h1>
        <span style={{ fontSize: 12, color: FG.accent, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Mark all read</span>
      </div>

      {/* Filters */}
      <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', gap: 6 }}>
        {['All', 'Workouts', 'Meals', 'Badges'].map((t, i) => (
          <button key={t} style={{
            padding: '7px 14px', borderRadius: 99,
            background: i === 0 ? FG.bg2 : 'transparent',
            border: `1px solid ${i === 0 ? FG.lineStrong : FG.line}`,
            color: i === 0 ? FG.text : FG.mid,
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
          }}>{t}</button>
        ))}
      </div>

      {/* Hero notification (slide-in style) */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(249,115,22,0.04))',
          border: '1px solid rgba(249,115,22,0.4)',
          borderRadius: 18, padding: 16,
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: FG.accent, color: '#1a0a00',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 8px 20px rgba(249,115,22,0.4)',
            animation: 'pulseGlow 2s infinite',
          }}>⚒</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 700 }}>Badge unlocked</div>
            <div style={{ fontSize: 12, color: FG.mid, marginTop: 2 }}>Iron Forger — LVL 7 reached</div>
          </div>
          <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>2m</span>
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifs.slice(1).map((n, i) => {
          const tones = { accent: FG.accent, warn: FG.warn, ok: FG.ok, neutral: FG.mid };
          const c = tones[n.tone];
          return (
            <div key={i} style={{
              background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`,
              padding: 12, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${c}1A`, color: c, border: `1px solid ${c}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                flexShrink: 0,
              }}>{n.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{n.t}</div>
                <div style={{ fontSize: 12, color: FG.mid, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.sub}</div>
              </div>
              <span style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>{n.time}</span>
            </div>
          );
        })}
      </div>

      <FTabBar active="profile"/>
    </FMobileScreen>
  );
}

// ─── 9. LIBRARY (EXERCISES + FOODS) ────────────────────────────
function MobileLibrary() {
  const exercises = [
    { name: 'Barbell Bench Press', m: 'Chest', sets: '8.2k logged', e: '⚒' },
    { name: 'Conventional Deadlift', m: 'Back · Legs', sets: '6.4k logged', e: '◧' },
    { name: 'Back Squat', m: 'Legs', sets: '7.1k logged', e: '⚙' },
    { name: 'Pull-up', m: 'Back', sets: '4.8k logged', e: '◬' },
    { name: 'Overhead Press', m: 'Shoulders', sets: '3.2k logged', e: '◯' },
  ];
  return (
    <FMobileScreen padTop={56} padBottom={100}>
      <div style={{ padding: '0 20px 14px' }}>
        <h1 style={{ fontSize: 28 }}>Library</h1>
        <div style={{ fontSize: 13, color: FG.dim, marginTop: 2 }}>650 lifts · 1,800 foods</div>
      </div>

      {/* Search */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{
          background: FG.bg1, border: `1px solid ${FG.line}`,
          borderRadius: 14, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <span style={{ color: FG.dim, fontSize: 14, fontFamily: 'Inter, sans-serif', flex: 1 }}>Search lifts, food, recipes…</span>
          <FBadge tone="neutral">⌘K</FBadge>
        </div>
      </div>

      {/* Pills */}
      <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          { l: 'Lifts', on: true },
          { l: 'Foods', on: false },
          { l: 'Recipes', on: false },
          { l: 'Cardio', on: false },
        ].map(p => (
          <button key={p.l} style={{
            padding: '8px 14px', borderRadius: 99, flexShrink: 0,
            background: p.on ? FG.accent : 'transparent',
            border: `1px solid ${p.on ? FG.accent : FG.line}`,
            color: p.on ? '#1a0a00' : FG.mid,
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
          }}>{p.l}</button>
        ))}
      </div>

      {/* Filter chips */}
      <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', gap: 6, overflowX: 'auto' }}>
        {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'].map((c, i) => (
          <button key={c} style={{
            padding: '6px 12px', borderRadius: 99, flexShrink: 0,
            background: i === 0 ? 'rgba(249,115,22,0.12)' : FG.bg1,
            border: `1px solid ${i === 0 ? 'rgba(249,115,22,0.3)' : FG.line}`,
            color: i === 0 ? FG.accent : FG.mid,
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
          }}>{c}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {exercises.map((ex, i) => (
          <div key={i} style={{
            background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`,
            padding: 12, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div className="imgph" data-tone={i === 0 ? 'warm' : ''} style={{
              width: 50, height: 50, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>{ex.e}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600 }}>{ex.name}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center', fontSize: 11 }}>
                <span style={{ color: FG.accent, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{ex.m}</span>
                <span style={{ color: FG.dim }}>·</span>
                <span style={{ color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>{ex.sets}</span>
              </div>
            </div>
            <button style={{
              width: 32, height: 32, borderRadius: 16,
              background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
              color: FG.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        ))}
      </div>

      <FTabBar active="lift"/>
    </FMobileScreen>
  );
}

Object.assign(window, {
  MobileOnboarding, MobileDashboard, MobileWorkout, MobileDiet,
  MobileProgress, MobileProfile, MobileBadges, MobileNotifications, MobileLibrary,
});
