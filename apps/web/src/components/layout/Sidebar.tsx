'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ForgeLogo, FG } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { id: 'dashboard', path: '/dashboard', labelKey: 'nav.dashboard', icon: 'M3 12L12 4l9 8M5 10v10h14V10' },
  { id: 'workouts',  path: '/workouts',  labelKey: 'nav.workouts',  icon: 'M4 9h2v6H4zM18 9h2v6h-2zM7 11h10v2H7zM2 10h2v4H2zM20 10h2v4h-2z' },
  { id: 'meals',     path: '/meals',     labelKey: 'nav.meals',     icon: 'M6 3v9a3 3 0 003 3v6h2v-6a3 3 0 003-3V3M9 3v6M13 3v6M19 3c-1 2-1 5 0 8v10' },
  { id: 'progress',  path: '/progress',  labelKey: 'nav.progress',  icon: 'M3 17l6-6 4 4 8-8' },
  { id: 'badges',    path: '/badges',    labelKey: 'nav.badges',    icon: 'M12 2l2.5 5 5.5.8-4 3.9.9 5.5L12 14.6 7.1 17.2 8 11.7 4 7.8l5.5-.8z' },
  { id: 'library',   path: '/library',   labelKey: 'nav.library',   icon: 'M4 4h6v16H4zM14 4h6v6h-6zM14 14h6v6h-6z' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, gamification } = useAuthStore();
  const { t } = useTranslation();

  return (
    <aside style={{
      width: 220, height: '100%', background: FG.bg1,
      borderRight: `1px solid ${FG.line}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10,
    }}>
      <div style={{ padding: '22px 22px 28px' }}>
        <ForgeLogo size={20}/>
      </div>

      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.path);
          return (
            <Link key={item.id} href={item.path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10,
                background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
                color: active ? FG.accent : FG.mid,
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
                position: 'relative',
                transition: 'background 0.15s, color 0.15s',
              }}>
                {active && (
                  <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, borderRadius: 2, background: FG.accent }}/>
                )}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                {t(item.labelKey)}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: 12, borderTop: `1px solid ${FG.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8 }}>
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="" style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'cover' }}/>
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: FG.bg2, border: `1px solid ${FG.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: FG.accent, fontFamily: 'DM Sans, sans-serif',
            }}>
              {profile?.displayName?.[0] ?? '?'}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.displayName ?? 'Loading...'}
            </div>
            <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
              LVL {gamification?.level ?? '—'} · {gamification?.streakDays ?? 0}d
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth="2">
            <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
          </svg>
        </div>
      </div>
    </aside>
  );
}
