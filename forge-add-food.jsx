// Forge — "Add Food" flow. Mirror of Add Exercise but for nutrition.
// 3 mobile states + 1 web modal.
//   1. Search + API results (food DB w/ macros)
//   2. Barcode scanner / no results
//   3. Custom food create form

// Food row — different from exercise: shows macros + serving
function FoodRow({ name, brand, kcal, p, c, f, serving, e, source, onAdd }) {
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
          {source === 'barcode' && (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
              color: FG.warn, background: 'rgba(240,184,110,0.1)',
              border: '1px solid rgba(240,184,110,0.3)',
              padding: '1px 5px', borderRadius: 3, letterSpacing: '0.1em',
            }}>SCAN</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: FG.dim, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
          {brand && <><span style={{ color: FG.mid }}>{brand}</span><span style={{ margin: '0 6px', color: FG.line }}>·</span></>}
          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{serving}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.text }}>{kcal} kcal</span>
          <span style={{ color: FG.line }}>·</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.accent }}>{p}P</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.warn }}>{c}C</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.ok }}>{f}F</span>
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

// ─── MOBILE 1 · Search foods ───────────────────────────────────
function MobileAddFoodSearch() {
  const recent = [
    { name: 'Whey isolate',     brand: 'Growth',     kcal: 110, p: 23, c: 2,  f: 1, serving: '30g scoop', e: '◯', source: 'custom' },
    { name: 'Chicken breast',   brand: '',           kcal: 165, p: 31, c: 0,  f: 4, serving: '100g grilled', e: '🍗', source: 'api' },
  ];
  const results = [
    { name: 'Chicken breast',         brand: 'USDA',         kcal: 165, p: 31, c: 0,  f: 4,  serving: '100g',  e: '🍗', source: 'api' },
    { name: 'Chicken thigh',          brand: 'USDA',         kcal: 209, p: 26, c: 0,  f: 11, serving: '100g',  e: '🍖', source: 'api' },
    { name: 'Chicken rice bowl',      brand: 'Sweetgreen',   kcal: 540, p: 38, c: 64, f: 14, serving: '1 bowl', e: '🍱', source: 'api' },
    { name: 'Grilled chicken sandwich',brand: 'Chick-fil-A', kcal: 380, p: 28, c: 44, f: 11, serving: '1 sand.', e: '🥪', source: 'api' },
    { name: 'Chicken nuggets',        brand: 'McDonald\'s',  kcal: 250, p: 14, c: 15, f: 15, serving: '6 pcs',  e: '○',  source: 'api' },
    { name: 'Mom\'s chicken & rice',  brand: '',             kcal: 620, p: 42, c: 75, f: 14, serving: '1 plate',e: '◬', source: 'custom' },
  ];
  return (
    <FMobileScreen padTop={56} padBottom={120}>
      <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{ width: 36, height: 36, borderRadius: 18, background: FG.bg1, border: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>LUNCH · 13:00</div>
            <h1 style={{ fontSize: 20, marginTop: 1 }}>Log food</h1>
          </div>
        </div>
        {/* Barcode shortcut */}
        <button style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)',
          color: FG.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 5v14M7 5v14M10 5v14M14 5v14M17 5v14M21 5v14" strokeWidth="1.5"/>
          </svg>
        </button>
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
          <span style={{ color: FG.text, fontSize: 14, fontFamily: 'Inter, sans-serif', flex: 1 }}>chicken</span>
          <div style={{ width: 1, height: 16, background: FG.line }}/>
          <span style={{ color: FG.dim, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>6 hits</span>
        </div>
      </div>

      {/* Quick add row */}
      <div style={{ padding: '0 20px', marginBottom: 16, display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          { l: '📷 Scan', on: false },
          { l: 'All', on: true },
          { l: 'Brands', on: false },
          { l: 'Restaurants', on: false },
          { l: 'Mine', on: false },
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
          {recent.map((r, i) => <FoodRow key={i} {...r}/>)}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.dim, letterSpacing: '0.14em' }}>FROM FOOD DB</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: FG.ok }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: FG.ok, boxShadow: '0 0 6px rgba(94,209,154,0.6)' }}/>
            CONNECTED
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map((r, i) => <FoodRow key={i} {...r}/>)}
        </div>

        {/* Can't find */}
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
            <div style={{ fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Not on the list?</div>
            <div style={{ fontSize: 11, color: FG.mid, marginTop: 2 }}>Create your own food or recipe</div>
          </div>
          <FButton variant="soft" size="sm">Create</FButton>
        </div>
      </div>
    </FMobileScreen>
  );
}

// ─── MOBILE 2 · Scan / no results ──────────────────────────────
function MobileAddFoodScan() {
  return (
    <FMobileScreen padTop={56} padBottom={100}>
      {/* Header */}
      <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{ width: 36, height: 36, borderRadius: 18, background: FG.bg1, border: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <h1 style={{ fontSize: 20 }}>Scan barcode</h1>
      </div>

      {/* Scanner viewport */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <div style={{
          aspectRatio: '4 / 5', borderRadius: 20, position: 'relative',
          background: 'radial-gradient(circle at 50% 50%, #232C40 0%, #0B0F14 80%)',
          border: `1px solid ${FG.lineStrong}`, overflow: 'hidden',
        }}>
          {/* fake barcode */}
          <div style={{ position: 'absolute', top: '38%', left: '15%', right: '15%', height: 70, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
            {Array.from({length: 32}).map((_, i) => (
              <div key={i} style={{
                width: i % 4 === 0 ? 4 : i % 3 === 0 ? 2 : 1,
                height: 60 + (i % 3) * 6,
                background: i === 10 || i === 11 || i === 12 ? FG.accent : FG.text,
                opacity: 0.85,
              }}/>
            ))}
          </div>

          {/* corner brackets */}
          {[
            { top: 24, left: 24,   r: 'M0,20 L0,0 L20,0' },
            { top: 24, right: 24,  r: 'M-20,0 L0,0 L0,20' },
            { bottom: 24, left: 24, r: 'M0,-20 L0,0 L20,0' },
            { bottom: 24, right: 24, r: 'M-20,0 L0,0 L0,-20' },
          ].map((c, i) => (
            <svg key={i} width="32" height="32" viewBox="-20 -20 40 40" style={{
              position: 'absolute', ...c,
            }}>
              <path d={c.r} stroke={FG.accent} strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
          ))}

          {/* scan line */}
          <div style={{
            position: 'absolute', top: '50%', left: '12%', right: '12%',
            height: 2, background: FG.accent,
            boxShadow: `0 0 12px ${FG.accent}, 0 0 24px ${FG.accent}`,
          }}/>

          <div style={{
            position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.accent,
            letterSpacing: '0.18em',
          }}>// HOLD STEADY · UPC 7891000…</div>
        </div>
      </div>

      {/* Detected */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.ok, letterSpacing: '0.14em', marginBottom: 8 }}>
          ✓ DETECTED · 7891000100103
        </div>
        <FoodRow
          name="Greek Yogurt Natural"
          brand="Nestlé · 170g pot"
          kcal={102} p={10} c={14} f={0}
          serving="1 pot · 170g" e="◯" source="barcode"
        />
      </div>

      {/* Alt manual entry */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.dim, letterSpacing: '0.14em', marginBottom: 10 }}>
          OR TYPE IT IN
        </div>
        <button style={{
          width: '100%', padding: '14px 14px',
          background: 'transparent', border: `1px dashed ${FG.lineStrong}`,
          borderRadius: 14, color: FG.mid,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'Inter, sans-serif', fontSize: 13,
        }}>
          <span>Can't scan? Create custom food →</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>
    </FMobileScreen>
  );
}

// ─── MOBILE 3 · Custom food create ─────────────────────────────
function MobileAddFoodCustom() {
  return (
    <FMobileScreen padTop={56} padBottom={110}>
      {/* Header */}
      <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{ width: 36, height: 36, borderRadius: 18, background: FG.bg1, border: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 11, color: FG.accent, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>NEW · MINE</div>
            <h1 style={{ fontSize: 20, marginTop: 1 }}>Forge a food</h1>
          </div>
        </div>
      </div>

      {/* Tabs: single food vs recipe */}
      <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', gap: 4 }}>
        {[
          { l: 'Single food', on: true },
          { l: 'Recipe', on: false },
          { l: 'Meal', on: false },
        ].map(t => (
          <button key={t.l} style={{
            flex: 1, padding: '10px 0', borderRadius: 10,
            background: t.on ? FG.bg2 : 'transparent',
            border: `1px solid ${t.on ? FG.lineStrong : FG.line}`,
            color: t.on ? FG.text : FG.mid,
            fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600,
          }}>{t.l}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Name */}
        <div>
          <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 6 }}>NAME</div>
          <div style={{
            background: FG.bg1, border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: 12, padding: '14px 14px',
            boxShadow: '0 0 0 4px rgba(249,115,22,0.06)',
          }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 600 }}>
              Mom's chicken & rice<span style={{ color: FG.accent, animation: 'pulse 1.2s infinite' }}>│</span>
            </div>
          </div>
        </div>

        {/* Serving */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 6 }}>SERVING SIZE</div>
            <div style={{
              background: FG.bg1, border: `1px solid ${FG.line}`,
              borderRadius: 10, padding: '12px 12px',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: FG.text,
            }}>350<span style={{ color: FG.dim, marginLeft: 4 }}>g</span></div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 6 }}>UNIT</div>
            <div style={{
              background: FG.bg1, border: `1px solid ${FG.line}`,
              borderRadius: 10, padding: '12px 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 13, fontFamily: 'Inter, sans-serif',
            }}>
              <span>1 plate</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* Macros */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>MACROS · PER SERVING</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.accent }}>auto = 620 kcal</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[
              { l: 'kcal', v: '620', c: FG.text },
              { l: 'P', v: '42', c: FG.accent },
              { l: 'C', v: '75', c: FG.warn },
              { l: 'F', v: '14', c: FG.ok },
            ].map(m => (
              <div key={m.l} style={{
                background: FG.bg1, border: `1px solid ${FG.line}`,
                borderRadius: 10, padding: 12, textAlign: 'center',
              }}>
                <div className="num" style={{ fontSize: 22, color: m.c }}>{m.v}</div>
                <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginTop: 2 }}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Macro split visual */}
        <div>
          <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 6 }}>SPLIT</div>
          <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', border: `1px solid ${FG.line}` }}>
            <div style={{ width: '27%', background: FG.accent }}/>
            <div style={{ width: '48%', background: FG.warn }}/>
            <div style={{ width: '25%', background: FG.ok }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: FG.mid, fontFamily: 'JetBrains Mono, monospace' }}>
            <span>27% P</span><span>48% C</span><span>25% F</span>
          </div>
        </div>

        {/* Privacy */}
        <div style={{
          background: FG.bg1, border: `1px solid ${FG.line}`,
          borderRadius: 12, padding: 14,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(94,209,154,0.12)', color: FG.ok,
            border: '1px solid rgba(94,209,154,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Private to me</div>
            <div style={{ fontSize: 11, color: FG.dim }}>Only you'll see it in search</div>
          </div>
          <div style={{
            width: 38, height: 22, borderRadius: 11, background: FG.accent,
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: 9, background: '#1a0a00' }}/>
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
          Forge & log to lunch
        </FButton>
      </div>
    </FMobileScreen>
  );
}

// ─── WEB · Add Food modal ──────────────────────────────────────
function WebAddFood() {
  const results = [
    { name: 'Chicken breast',          brand: 'USDA',         kcal: 165, p: 31, c: 0,  f: 4,  serving: '100g',   e: '🍗', source: 'api' },
    { name: 'Chicken thigh',           brand: 'USDA',         kcal: 209, p: 26, c: 0,  f: 11, serving: '100g',   e: '🍖', source: 'api' },
    { name: 'Chicken rice bowl',       brand: 'Sweetgreen',   kcal: 540, p: 38, c: 64, f: 14, serving: '1 bowl', e: '🍱', source: 'api' },
    { name: 'Grilled chicken sandwich',brand: 'Chick-fil-A',  kcal: 380, p: 28, c: 44, f: 11, serving: '1 sand.',e: '🥪', source: 'api' },
    { name: 'Chicken nuggets',         brand: "McDonald's",   kcal: 250, p: 14, c: 15, f: 15, serving: '6 pcs',  e: '○',  source: 'api' },
    { name: "Mom's chicken & rice",    brand: '',             kcal: 620, p: 42, c: 75, f: 14, serving: '1 plate',e: '◬', source: 'custom' },
  ];

  return (
    <div className="forge" style={{ width: '100%', height: '100%', background: FG.bg0, display: 'flex', overflow: 'hidden' }}>
      <WebSidebar active="meals"/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <WebTopBar title="Today's plate" subtitle="2,650 kcal target · cut phase"/>

        {/* Ghost background */}
        <div style={{ flex: 1, padding: 24, overflow: 'hidden', filter: 'blur(6px) brightness(0.55)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 180, background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}` }}/>)}
          </div>
          <div style={{ height: 14, width: 200, background: FG.bg2, borderRadius: 4, marginBottom: 12 }}/>
          {[1,2,3].map(i => <div key={i} style={{ height: 72, background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`, marginBottom: 10 }}/>)}
        </div>

        {/* Scrim */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(11,15,20,0.65)', backdropFilter: 'blur(2px)',
        }}/>

        {/* Modal */}
        <div style={{
          position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
          width: 820, maxHeight: 'calc(100% - 110px)',
          background: FG.bg1, borderRadius: 18,
          border: `1px solid ${FG.lineStrong}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.1)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: FG.accent, letterSpacing: '0.14em' }}>LOG · LUNCH · 13:00</div>
              <h2 style={{ fontSize: 20, marginTop: 4, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>Add food</h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{
                padding: '8px 14px', borderRadius: 10, background: 'rgba(249,115,22,0.12)',
                border: '1px solid rgba(249,115,22,0.3)', color: FG.accent,
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 5v14M7 5v14M10 5v14M14 5v14M17 5v14M21 5v14" strokeWidth="1.5"/>
                </svg>
                Scan
              </button>
              <button style={{ width: 32, height: 32, borderRadius: 16, background: 'transparent', border: `1px solid ${FG.line}`, color: FG.mid, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: '18px 24px 12px' }}>
            <div style={{
              background: FG.bg2, border: '1px solid rgba(249,115,22,0.4)',
              borderRadius: 12, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 0 0 4px rgba(249,115,22,0.06)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <span style={{ color: FG.text, fontSize: 14, fontFamily: 'Inter, sans-serif', flex: 1 }}>
                chicken<span style={{ color: FG.accent, animation: 'pulse 1.2s infinite' }}>│</span>
              </span>
              <div style={{ width: 1, height: 16, background: FG.line }}/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: FG.ok, fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: FG.ok, boxShadow: '0 0 6px rgba(94,209,154,0.6)' }}/>
                FOOD DB · 6
              </div>
              <span style={{ color: FG.dim, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', padding: '2px 5px', background: FG.bg2, borderRadius: 4, border: `1px solid ${FG.line}` }}>ESC</span>
            </div>
          </div>

          {/* Filters */}
          <div style={{ padding: '0 24px 14px', display: 'flex', gap: 6 }}>
            {[
              { l: 'All', on: true },
              { l: 'Whole foods', on: false },
              { l: 'Brands', on: false },
              { l: 'Restaurants', on: false },
              { l: 'My foods', on: false },
            ].map(p => (
              <button key={p.l} style={{
                padding: '6px 12px', borderRadius: 99,
                background: p.on ? 'rgba(249,115,22,0.12)' : 'transparent',
                border: `1px solid ${p.on ? 'rgba(249,115,22,0.3)' : FG.line}`,
                color: p.on ? FG.accent : FG.mid,
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
              }}>{p.l}</button>
            ))}
          </div>

          {/* Results */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map((r, i) => <FoodRow key={i} {...r}/>)}
          </div>

          {/* Footer */}
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
              <div style={{ fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>Don't see it?</div>
              <div style={{ fontSize: 12, color: FG.mid, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
                Forge a custom food or recipe — saved to your private library with macros you define.
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
  MobileAddFoodSearch, MobileAddFoodScan, MobileAddFoodCustom, WebAddFood,
});
