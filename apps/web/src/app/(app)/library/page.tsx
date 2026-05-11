'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FCard, FButton, FSectionHead, FG } from '@/components/ui';
import { POPULAR_EXERCISES } from '@forge/common';

const SECTIONS = ['Lifts', 'Foods', 'Recipes', 'Cardio'];
const FILTERS = [
  { l: 'Muscle: All', on: false },
  { l: 'Equipment: Barbell', on: true },
  { l: 'Difficulty: Any', on: false },
  { l: 'Sort: Most logged', on: false },
];

export default function LibraryPage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('Lifts');
  const [query, setQuery] = useState('');

  const filtered = POPULAR_EXERCISES.filter(ex =>
    !query || ex.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 32px', borderBottom: `1px solid ${FG.line}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>{t('library.title')}</h1>
          <div style={{ fontSize: 13, color: FG.mid, marginTop: 2 }}>650 lifts · 1,800 foods · 240 recipes</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <FButton variant="ghost" size="sm">{t('common.export')}</FButton>
          <FButton size="sm">{t('library.customLift')}</FButton>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {/* Section toggle */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setActiveSection(s)} style={{
              padding: '8px 18px', borderRadius: 8,
              background: activeSection === s ? FG.accent : 'transparent',
              border: `1px solid ${activeSection === s ? FG.accent : FG.line}`,
              color: activeSection === s ? '#1a0a00' : FG.mid,
              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
            }}>{s}</button>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ background: FG.bg1, border: `1px solid ${FG.line}`, borderRadius: 10, padding: '8px 12px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, maxWidth: 400 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('library.search')}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: FG.text, fontSize: 13, fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginRight: 4 }}>{t('library.filters')}</span>
          {FILTERS.map((f, i) => (
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

        {/* Exercise grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {filtered.map((ex, i) => (
            <FCard key={ex.id} padding={0} style={{ overflow: 'hidden', cursor: 'pointer' }}>
              <div className="imgph" data-tone={i === 0 ? 'warm' : ''} style={{
                aspectRatio: '16 / 10', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 44, opacity: 0.6 }}>⚒</span>
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                  padding: '3px 8px', borderRadius: 6,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                  color: FG.text, letterSpacing: '0.1em',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <svg width="8" height="8" viewBox="0 0 8 8"><path d="M2 1l5 3-5 3z" fill="currentColor"/></svg>
                  {t('library.video')}
                </div>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700 }}>{ex.name}</div>
                <div style={{ fontSize: 11, color: FG.accent, marginTop: 3, fontFamily: 'Inter, sans-serif', fontWeight: 500, textTransform: 'capitalize' }}>{ex.muscleGroup}</div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
                  <span>{ex.equipment.toUpperCase()}</span>
                  <span>{(ex.timesLogged ?? 0) >= 1000 ? `${((ex.timesLogged ?? 0)/1000).toFixed(1)}k` : ex.timesLogged} {t('library.logged')}</span>
                </div>
              </div>
            </FCard>
          ))}
        </div>
      </div>
    </div>
  );
}
