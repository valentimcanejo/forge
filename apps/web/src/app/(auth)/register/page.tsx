'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { registerWithEmail, loginWithGoogle } from '@forge/common';
import { ForgeLogo, FButton, FG } from '@/components/ui';

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error(t('auth.passwordMinLength')); return; }
    setLoading(true);
    try {
      await registerWithEmail(email, password, name);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toast.error(msg.includes('email-already-in-use') ? t('auth.emailInUse') : t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: FG.bg2, border: `1px solid ${FG.line}`, borderRadius: 12,
    padding: '12px 14px', color: FG.text, fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%',
  };

  return (
    <div style={{ height: '100vh', background: FG.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(80% 50% at 50% 110%, rgba(249,115,22,0.35) 0%, transparent 60%)', pointerEvents: 'none' }}/>

      <div style={{ width: '100%', maxWidth: 400, padding: 24, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <ForgeLogo size={32}/>
          <h1 style={{ fontSize: 26, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', marginTop: 20, lineHeight: 1.1 }}>
            {t('auth.registerHeading')}
          </h1>
          <p style={{ color: FG.mid, fontSize: 14, lineHeight: 1.5, marginTop: 8 }}>{t('auth.registerSubtitle')}</p>
        </div>

        <div style={{ background: FG.bg1, border: `1px solid ${FG.line}`, borderRadius: 20, padding: 24 }}>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder={t('auth.fullName')} style={inputStyle}/>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder={t('auth.email')} style={inputStyle}/>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder={t('auth.password')} minLength={6} style={inputStyle}/>
            <FButton type="submit" size="lg" fullWidth disabled={loading}>
              {loading ? t('auth.creatingAccount') : t('auth.register')}
            </FButton>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: FG.line }}/>
            <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>{t('common.or')}</span>
            <div style={{ flex: 1, height: 1, background: FG.line }}/>
          </div>

          <FButton variant="ghost" fullWidth onClick={async () => { setLoading(true); try { await loginWithGoogle(); router.replace('/dashboard'); } catch { toast.error(t('auth.googleFailed')); } finally { setLoading(false); } }}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v3.8h5.35c-.5 2.4-2.55 3.8-5.35 3.8-3.2 0-5.8-2.6-5.8-5.7s2.6-5.7 5.8-5.7c1.45 0 2.75.5 3.75 1.45l2.7-2.7C16.85 4.4 14.6 3.5 12 3.5 7 3.5 3 7.5 3 12.5S7 21.5 12 21.5c5.2 0 8.6-3.65 8.6-8.8 0-.55-.05-1.1-.25-1.6z"/></svg>
            {t('auth.continueWithGoogle')}
          </FButton>

          <div style={{ textAlign: 'center', marginTop: 16, color: FG.dim, fontSize: 13 }}>
            {t('auth.haveAccount')}{' '}
            <Link href="/login" style={{ color: FG.accent, fontWeight: 600, textDecoration: 'none' }}>{t('auth.login')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
