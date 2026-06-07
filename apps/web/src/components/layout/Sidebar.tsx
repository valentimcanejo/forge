'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ForgeLogo, FG } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@forge/common';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { id: 'workouts', path: '/workouts', label: 'Treino',  icon: 'M4 9h2v6H4zM18 9h2v6h-2zM7 11h10v2H7zM2 10h2v4H2zM20 10h2v4h-2z' },
  { id: 'meals',    path: '/meals',    label: 'Dieta',   icon: 'M6 3v9a3 3 0 003 3v6h2v-6a3 3 0 003-3V3M9 3v6M13 3v6M19 3c-1 2-1 5 0 8v10' },
  { id: 'profile',  path: '/profile',  label: 'Perfil',  icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, user } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const name = profile?.displayName || user?.displayName || 'Atleta';

  return (
    <aside style={{
      width: 200, height: '100%', background: FG.bg1,
      borderRight: `1px solid ${FG.line}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10,
    }}>
      <div style={{ padding: '20px 20px 24px' }}>
        <ForgeLogo size={20}/>
      </div>

      <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.path);
          return (
            <Link key={item.id} href={item.path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
                color: active ? FG.accent : FG.mid,
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
                position: 'relative',
              }}>
                {active && (
                  <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, borderRadius: 2, background: FG.accent }}/>
                )}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer: user + logout */}
      <div style={{ padding: 10, borderTop: `1px solid ${FG.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: FG.bg2, border: `1px solid rgba(249,115,22,0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: FG.accent, fontFamily: 'DM Sans, sans-serif',
          }}>
            {name[0]?.toUpperCase() ?? '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: FG.text }}>
              {name}
            </div>
            {user?.isAnonymous && (
              <div style={{ fontSize: 10, color: FG.accent, marginTop: 1 }}>visitante</div>
            )}
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: FG.dim, display: 'flex', alignItems: 'center' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
