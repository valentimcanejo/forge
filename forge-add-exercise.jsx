// Forge — "Add Exercise" flow. 3 states:
//   1. Search + results (from external API)
//   2. No results → suggest create custom
//   3. Custom exercise create form
// Both mobile (full-sheet) and web (modal over workout page).

// Mock API result row
function APIRow({ name, m, eq, logged, e, source, onAdd }) {
  return (
    <div style={{
      background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`,
      padding: 12, display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div className="imgph" style={{
        width: 44, height: 44, borderRadius: 11, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>{e}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600 }}>{name}</span>
          {source === 'api' && (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
              color: FG.accent, background: 'rgba(249,115,22,0.12)',
              border: '1px solid rgba(249,115,22,0.3)',
              padding: '1px 5px', borderRadius: 3, letterSpacing: '0.1em',
            }}>API</span>
          )}
          {source === 'custom' && (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
              color: FG.ok, background: 'rgba(94,209,154,0.1)',
              border: '1px solid rgba(94,209,154,0.3)',
              padding: '1px 5px', borderRadius: 3, letterSpacing: '0.1em',
            }}>MINE</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: FG.dim, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
          <span style={{ color: FG.mid }}>{m}</span>
          <span style={{ margin: '0 6px', color: FG.line }}>·</span>
          <span>{eq}</span>
          {logged && (
            <>
              <span style={{ margin: '0 6px', color: FG.line }}>·</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{logged}</span>
            </>
          )}
        </div>
      </div>
      <button onClick={onAdd} style={{
        width: 34, height: 34, borderRadius: 17,
        background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
        color: FG.accent, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>
  );
}

// ─── MOBILE 1 · Search + API results ───────────────────────────
function MobileAddSearch() {
  const recent = [
    { name: 'Cable Fly',           m: 'Chest',    eq: 'Cable',    logged: '40 lb · 3 days', e: '◬', source: 'api' },
    { name: 'Incline DB Press',    m: 'Chest',    eq: 'Dumbbell', logged: '70 lb · 6 days', e: '⚒', source: 'api' },
  ];
  const results = [
    { name: 'Barbell Bench Press', m: 'Chest',    eq: 'Barbell',  logged: '8.2k uses', e: '⚒', source: 'api' },
    { name: 'Dumbbell Bench Press',m: 'Chest',    eq: 'Dumbbell', logged: '5.6k uses', e: '◧', source: 'api' },
    { name: 'Decline Bench Press', m: 'Chest',    eq: 'Barbell',  logged: '1.8k uses', e: '◫', source: 'api' },
    { name: 'Smith Bench Press',   m: 'Chest',    eq: 'Smith',    logged: '1.2k uses', e: '◪', source: 'api' },
    { name: 'Floor Press',         m: 'Chest',    eq: 'Barbell',  logged: '420 uses',  e: '◰', source: 'api' },
    { name: 'Bench Press (DIY)',   m: 'Chest',    eq: 'Custom',   logged: '12 sessions', e: '⚙', source: 'custom' },
  ];
  return (
    <FMobileScreen padTop={56} padBottom={120}>
      {/* Header */}
      <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{ width: 36, height: 36, borderRadius: 18, background: FG.bg1, border: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <h1 style={{ fontSize: 22 }}>Add exercise</h1>
      </div>

      {/* Search */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{
          background: FG.bg1, border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: 14, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 0 0 4px rgba(249,115,22,0.06)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <span style={{ color: FG.text, fontSize: 14, fontFamily: 'Inter, sans-serif', flex: 1 }}>bench press</span>
          <div style={{ width: 1, height: 16, background: FG.line }}/>
          <span style={{ color: FG.dim, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>6 results</span>
        </div>
      </div>

      {/* Muscle filter chips */}
      <div style={{ padding: '0 20px', marginBottom: 16, display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          { l: 'All', on: false },
          { l: 'Chest', on: true },
          { l: 'Back', on: false },
          { l: 'Legs', on: false },
          { l: 'Arms', on: false },
        ].map(p => (
          <button key={p.l} style={{
            padding: '6px 12px', borderRadius: 99, flexShrink: 0,
            background: p.on ? 'rgba(249,115,22,0.12)' : FG.bg1,
            border: `1px solid ${p.on ? 'rgba(249,115,22,0.3)' : FG.line}`,
            color: p.on ? FG.accent : FG.mid,
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
          }}>{p.l}</button>
        ))}
      </div>

      {/* Recent */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.dim, letterSpacing: '0.14em', marginBottom: 8 }}>YOUR RECENT</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recent.map((r, i) => <APIRow key={i} {...r}/>)}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.dim, letterSpacing: '0.14em' }}>FROM EXERCISE DB</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: FG.ok }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: FG.ok, boxShadow: '0 0 6px rgba(94,209,154,0.6)' }}/>
            CONNECTED
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map((r, i) => <APIRow key={i} {...r}/>)}
        </div>

        {/* Can't find it? */}
        <div style={{
          marginTop: 14, padding: 14, borderRadius: 14,
          background: 'rgba(255,255,255,0.02)',
          border: `1px dashed ${FG.lineStrong}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'rgba(249,115,22,0.1)', color: FG.accent,
            border: '1px solid rgba(249,115,22,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Can't find it?</div>
            <div style={{ fontSize: 11, color: FG.mid, marginTop: 2 }}>Create your own exercise</div>
          </div>
          <FButton variant="soft" size="sm">Create</FButton>
        </div>
      </div>
    </FMobileScreen>
  );
}

// ─── MOBILE 2 · Empty / not found ──────────────────────────────
function MobileAddEmpty() {
  return (
    <FMobileScreen padTop={56} padBottom={100}>
      {/* Header */}
      <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{ width: 36, height: 36, borderRadius: 18, background: FG.bg1, border: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <h1 style={{ fontSize: 22 }}>Add exercise</h1>
      </div>

      {/* Search filled */}
      <div style={{ padding: '0 20px', marginBottom: 24 }}>
        <div style={{
          background: FG.bg1, border: `1px solid ${FG.line}`,
          borderRadius: 14, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <span style={{ color: FG.text, fontSize: 14, fontFamily: 'Inter, sans-serif', flex: 1 }}>landmine twist deadlift</span>
          <button style={{ background: 'none', border: 'none', color: FG.dim, padding: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 8l8 8M16 8l-8 8"/></svg>
          </button>
        </div>
      </div>

      {/* Empty state */}
      <div style={{
        padding: '0 24px', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        marginBottom: 28,
      }}>
        <div style={{
          width: 84, height: 84, borderRadius: 22,
          background: 'rgba(249,115,22,0.08)',
          border: '1px dashed rgba(249,115,22,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: -8, borderRadius: 30,
            background: 'radial-gradient(circle, rgba(249,115,22,0.18), transparent 70%)',
          }}/>
          <span style={{ fontSize: 40, position: 'relative', filter: 'grayscale(0.3)' }}>⚒</span>
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>No match in the DB</h2>
          <p style={{ fontSize: 13, color: FG.mid, marginTop: 6, maxWidth: 260, lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
            Got something niche? Forge it yourself — your custom lifts track exactly like ours.
          </p>
        </div>
        <FBadge tone="neutral" icon={<span style={{ marginRight: 2 }}>○</span>}>0 results in 650 lifts</FBadge>
      </div>

      {/* Suggestions */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.dim, letterSpacing: '0.14em', marginBottom: 10 }}>
          MAYBE YOU MEANT
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { name: 'Landmine Press',     m: 'Shoulders', eq: 'Landmine', logged: '480 uses', e: '◬', source: 'api' },
            { name: 'Romanian Deadlift',  m: 'Hamstrings', eq: 'Barbell', logged: '2.9k uses', e: '◫', source: 'api' },
          ].map((r, i) => <APIRow key={i} {...r}/>)}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px' }}>
        <FButton size="lg" style={{ width: '100%' }}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>}>
          Create "landmine twist deadlift"
        </FButton>
      </div>
    </FMobileScreen>
  );
}

// ─── MOBILE 3 · Create custom form ─────────────────────────────
function MobileAddCustom() {
  return (
    <FMobileScreen padTop={56} padBottom={110}>
      {/* Header */}
      <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{ width: 36, height: 36, borderRadius: 18, background: FG.bg1, border: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 11, color: FG.accent, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>NEW · MINE</div>
            <h1 style={{ fontSize: 20, marginTop: 1 }}>Forge an exercise</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Name */}
        <div>
          <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 6 }}>NAME</div>
          <div style={{
            background: FG.bg1, border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: 12, padding: '14px 14px',
            boxShadow: '0 0 0 4px rgba(249,115,22,0.06)',
          }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 600, color: FG.text }}>
              Landmine Twist Deadlift<span style={{ color: FG.accent, animation: 'pulse 1.2s infinite' }}>│</span>
            </div>
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 6 }}>ICON</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['⚒', '◧', '⚙', '◬', '◯', '◫', '◪', '◰', '✦', '☉'].map((e, i) => (
              <div key={i} style={{
                width: 38, height: 38, borderRadius: 11,
                background: i === 5 ? 'rgba(249,115,22,0.14)' : FG.bg1,
                border: `1px solid ${i === 5 ? 'rgba(249,115,22,0.4)' : FG.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>{e}</div>
            ))}
          </div>
        </div>

        {/* Primary muscle */}
        <div>
          <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 6 }}>PRIMARY MUSCLE</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Glutes', 'Hamstrings'].map((m, i) => (
              <button key={m} style={{
                padding: '8px 12px', borderRadius: 10,
                background: i === 7 ? FG.accent : FG.bg1,
                border: `1px solid ${i === 7 ? FG.accent : FG.line}`,
                color: i === 7 ? '#1a0a00' : FG.mid,
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
              }}>{m}</button>
            ))}
          </div>
        </div>

        {/* Secondary muscles */}
        <div>
          <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 6 }}>SECONDARY</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { l: 'Core', on: true },
              { l: 'Glutes', on: true },
              { l: 'Back', on: false },
              { l: 'Forearms', on: false },
            ].map(m => (
              <button key={m.l} style={{
                padding: '6px 10px', borderRadius: 99,
                background: m.on ? 'rgba(249,115,22,0.12)' : 'transparent',
                border: `1px solid ${m.on ? 'rgba(249,115,22,0.3)' : FG.line}`,
                color: m.on ? FG.accent : FG.mid,
                fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500,
              }}>{m.on ? '✓ ' : '+ '}{m.l}</button>
            ))}
          </div>
        </div>

        {/* Equipment + type — two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 6 }}>EQUIPMENT</div>
            <div style={{
              background: FG.bg1, border: `1px solid ${FG.line}`,
              borderRadius: 10, padding: '12px 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Landmine</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 6 }}>TRACK BY</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['Reps', 'Time'].map((t, i) => (
                <button key={t} style={{
                  flex: 1, padding: '12px 0', borderRadius: 10,
                  background: i === 0 ? FG.bg2 : FG.bg1,
                  border: `1px solid ${i === 0 ? FG.lineStrong : FG.line}`,
                  color: i === 0 ? FG.text : FG.mid,
                  fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600,
                }}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes / form cue */}
        <div>
          <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 6 }}>FORM CUE · OPTIONAL</div>
          <div style={{
            background: FG.bg1, border: `1px solid ${FG.line}`,
            borderRadius: 12, padding: 12, minHeight: 60,
            fontSize: 13, color: FG.dim, fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
          }}>
            Brace core. Drive through heels, rotate at hip.
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', bottom: 26, left: 20, right: 20,
        display: 'flex', gap: 10,
      }}>
        <FButton variant="ghost" style={{ flex: 1 }}>Cancel</FButton>
        <FButton size="md" style={{ flex: 2 }}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>}>
          Forge & add to today
        </FButton>
      </div>
    </FMobileScreen>
  );
}

// ─── WEB · Add Exercise (modal over workout) ───────────────────
function WebAddExercise() {
  const results = [
    { name: 'Barbell Bench Press',  m: 'Chest', eq: 'Barbell',  logged: '8.2k uses', e: '⚒', source: 'api' },
    { name: 'Dumbbell Bench Press', m: 'Chest', eq: 'Dumbbell', logged: '5.6k uses', e: '◧', source: 'api' },
    { name: 'Incline Bench Press',  m: 'Chest', eq: 'Barbell',  logged: '4.4k uses', e: '◫', source: 'api' },
    { name: 'Decline Bench Press',  m: 'Chest', eq: 'Barbell',  logged: '1.8k uses', e: '◪', source: 'api' },
    { name: 'Smith Bench Press',    m: 'Chest', eq: 'Smith',    logged: '1.2k uses', e: '◰', source: 'api' },
    { name: 'Floor Press',          m: 'Chest', eq: 'Barbell',  logged: '420 uses',  e: '◬', source: 'api' },
    { name: 'Bench Press (DIY)',    m: 'Chest', eq: 'Custom',   logged: '12 of mine', e: '⚙', source: 'custom' },
  ];

  return (
    <div className="forge" style={{ width: '100%', height: '100%', background: FG.bg0, display: 'flex', overflow: 'hidden' }}>
      <WebSidebar active="workouts"/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <WebTopBar title="Push Day" subtitle="Week 6 · Push / Pull / Legs"/>

        {/* Ghost background (workout table peek) */}
        <div style={{ flex: 1, padding: 24, overflow: 'hidden', filter: 'blur(6px) brightness(0.55)' }}>
          <div style={{
            background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`,
            height: '100%', padding: 20,
          }}>
            <div style={{ height: 24, width: 200, background: FG.bg2, borderRadius: 4, marginBottom: 16 }}/>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: `1px solid ${FG.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: FG.bg2 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 14, width: '60%', background: FG.bg2, borderRadius: 3, marginBottom: 6 }}/>
                  <div style={{ height: 10, width: '30%', background: FG.bg2, borderRadius: 3 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal scrim */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(11,15,20,0.65)',
          backdropFilter: 'blur(2px)',
        }}/>

        {/* Modal */}
        <div style={{
          position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
          width: 780, maxHeight: 'calc(100% - 110px)',
          background: FG.bg1, borderRadius: 18,
          border: `1px solid ${FG.lineStrong}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.1)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Modal header */}
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.accent, letterSpacing: '0.14em' }}>NEW LIFT · PUSH DAY</div>
              <h2 style={{ fontSize: 20, marginTop: 4, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>Add exercise</h2>
            </div>
            <button style={{ width: 32, height: 32, borderRadius: 16, background: 'transparent', border: `1px solid ${FG.line}`, color: FG.mid, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>

          {/* Search */}
          <div style={{ padding: '18px 24px 14px' }}>
            <div style={{
              background: FG.bg2, border: '1px solid rgba(249,115,22,0.4)',
              borderRadius: 12, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 0 0 4px rgba(249,115,22,0.06)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <span style={{ color: FG.text, fontSize: 14, fontFamily: 'Inter, sans-serif', flex: 1 }}>
                bench press<span style={{ color: FG.accent, animation: 'pulse 1.2s infinite' }}>│</span>
              </span>
              <div style={{ width: 1, height: 16, background: FG.line }}/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: FG.ok, fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: FG.ok, boxShadow: '0 0 6px rgba(94,209,154,0.6)' }}/>
                EXERCISE DB · 7
              </div>
              <span style={{ color: FG.dim, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', padding: '2px 5px', background: FG.bg2, borderRadius: 4, border: `1px solid ${FG.line}` }}>ESC</span>
            </div>
          </div>

          {/* Filter row */}
          <div style={{ padding: '0 24px 14px', display: 'flex', gap: 6 }}>
            {['All', 'Chest', 'Triceps', 'Shoulders'].map((t, i) => (
              <button key={t} style={{
                padding: '6px 12px', borderRadius: 99,
                background: i === 1 ? 'rgba(249,115,22,0.12)' : 'transparent',
                border: `1px solid ${i === 1 ? 'rgba(249,115,22,0.3)' : FG.line}`,
                color: i === 1 ? FG.accent : FG.mid,
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
              }}>{t}</button>
            ))}
            <div style={{ flex: 1 }}/>
            <button style={{
              padding: '6px 12px', borderRadius: 99, background: 'transparent',
              border: `1px solid ${FG.line}`, color: FG.mid,
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Equipment: All
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>

          {/* Results list */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map((r, i) => <APIRow key={i} {...r}/>)}
          </div>

          {/* Footer — Can't find */}
          <div style={{
            padding: 18, borderTop: `1px solid ${FG.line}`,
            background: 'rgba(249,115,22,0.04)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(249,115,22,0.15)', color: FG.accent,
              border: '1px solid rgba(249,115,22,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>Can't find your lift?</div>
              <div style={{ fontSize: 12, color: FG.mid, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
                Forge your own — it'll be saved to your private library and track exactly like the rest.
              </div>
            </div>
            <FButton variant="ghost" size="sm">Skip</FButton>
            <FButton size="sm"
              icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>}>
              Create custom
            </FButton>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  MobileAddSearch, MobileAddEmpty, MobileAddCustom, WebAddExercise,
});
