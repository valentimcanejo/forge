'use client';
import { useRouter } from 'next/navigation';
import { FG, FButton } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@forge/common';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, gamification } = useAuthStore();
  const router = useRouter();

  const name = profile?.displayName || user?.displayName || 'Atleta';
  const email = profile?.email || user?.email || '';
  const totalWorkouts = gamification?.totalWorkouts ?? 0;
  const joinedStr = profile?.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString('pt', { month: 'long', year: 'numeric' })
    : '';

  async function handleLogout() {
    try {
      await logout();
      router.replace('/login');
    } catch {
      toast.error('Erro ao sair');
    }
  }

  const ROWS = [
    { label: 'Peso',    value: profile?.weightKg ? `${profile.weightKg} kg` : '—' },
    { label: 'Altura',  value: profile?.heightCm ? `${profile.heightCm} cm` : '—' },
    { label: 'Objetivo', value: profile?.goal ?? '—' },
    { label: 'Idioma',  value: profile?.language?.toUpperCase() ?? 'PT' },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 48px', background: FG.bg0 }}>
      <div style={{ maxWidth: 520 }}>

        {/* Guest banner */}
        {user?.isAnonymous && (
          <div style={{ marginBottom: 24, padding: '12px 16px', borderRadius: 12, background: 'rgba(249,115,22,0.1)', border: `1px solid rgba(249,115,22,0.35)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 13, color: FG.mid }}>Modo visitante — os dados podem ser perdidos</span>
            <Link href="/register" style={{ fontSize: 13, fontWeight: 600, color: FG.accent, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Criar conta →
            </Link>
          </div>
        )}

        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, flexShrink: 0,
            background: '#2a1a14', border: `2px solid rgba(249,115,22,0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: FG.accent, fontFamily: 'DM Sans, sans-serif',
          }}>
            {name[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: FG.text, fontFamily: 'DM Sans, sans-serif' }}>{name}</div>
            {email && <div style={{ fontSize: 13, color: FG.dim, marginTop: 4 }}>{email}</div>}
            <div style={{ fontSize: 12, color: FG.mid, marginTop: 4 }}>
              {[totalWorkouts > 0 ? `${totalWorkouts} treinos` : null, joinedStr ? `desde ${joinedStr}` : null].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ background: FG.bg1, border: `1px solid ${FG.line}`, borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '10px 18px', borderBottom: `1px solid ${FG.line}` }}>
            <span style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase' }}>Dados</span>
          </div>
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', borderBottom: i < ROWS.length - 1 ? `1px solid ${FG.line}` : 'none' }}
            >
              <span style={{ fontSize: 13, color: FG.mid }}>{row.label}</span>
              <span style={{ fontSize: 13, color: FG.text, fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <FButton variant="ghost" fullWidth onClick={handleLogout} style={{ borderColor: 'rgba(226,109,109,0.3)', color: '#E26D6D' }}>
          Sair
        </FButton>

      </div>
    </div>
  );
}
