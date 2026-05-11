'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { loginWithEmail, loginWithGoogle } from '@forge/common';
import { ForgeLogo, FButton, FG } from '@/components/ui';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.error(msg.includes('wrong-password') || msg.includes('user-not-found') ? 'Invalid email or password' : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await loginWithGoogle();
      router.replace('/dashboard');
    } catch {
      toast.error('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: '100vh', background: FG.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(80% 50% at 50% 110%, rgba(249,115,22,0.35) 0%, transparent 60%)', pointerEvents: 'none' }}/>

      <div style={{ width: '100%', maxWidth: 400, padding: 24, position: 'relative', animation: 'fadeIn 0.4s ease forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <ForgeLogo size={32}/>
          <h1 style={{ fontSize: 28, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', marginTop: 24, lineHeight: 1.1 }}>
            {t('auth.tagline')}
          </h1>
          <p style={{ color: FG.mid, fontSize: 14, lineHeight: 1.5, marginTop: 8 }}>{t('auth.subtitle')}</p>
        </div>

        <div style={{ background: FG.bg1, border: `1px solid ${FG.line}`, borderRadius: 20, padding: 24 }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder={t('auth.email')}
              style={{
                background: FG.bg2, border: `1px solid ${FG.line}`, borderRadius: 12,
                padding: '12px 14px', color: FG.text, fontSize: 14,
                fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%',
              }}
            />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder={t('auth.password')}
              style={{
                background: FG.bg2, border: `1px solid ${FG.line}`, borderRadius: 12,
                padding: '12px 14px', color: FG.text, fontSize: 14,
                fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%',
              }}
            />
            <FButton type="submit" size="lg" fullWidth disabled={loading}>
              {loading ? 'Signing in…' : t('auth.login')}
            </FButton>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: FG.line }}/>
            <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: FG.line }}/>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <FButton variant="ghost" style={{ flex: 1 }} onClick={handleGoogle}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v3.8h5.35c-.5 2.4-2.55 3.8-5.35 3.8-3.2 0-5.8-2.6-5.8-5.7s2.6-5.7 5.8-5.7c1.45 0 2.75.5 3.75 1.45l2.7-2.7C16.85 4.4 14.6 3.5 12 3.5 7 3.5 3 7.5 3 12.5S7 21.5 12 21.5c5.2 0 8.6-3.65 8.6-8.8 0-.55-.05-1.1-.25-1.6z"/></svg>
              {t('auth.continueWithGoogle')}
            </FButton>
            <FButton variant="ghost" style={{ flex: 1 }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M16.46 12.6c0-2.5 2.05-3.7 2.13-3.78-1.16-1.7-2.97-1.93-3.62-1.96-1.55-.16-3 .9-3.79.9-.78 0-1.97-.87-3.24-.85-1.67.03-3.21.97-4.07 2.46-1.74 3.01-.45 7.46 1.25 9.9.83 1.2 1.81 2.55 3.1 2.5 1.25-.05 1.72-.81 3.23-.81 1.5 0 1.94.81 3.25.78 1.34-.03 2.19-1.22 3-2.43.94-1.4 1.34-2.74 1.36-2.81-.03-.02-2.6-1-2.6-3.93zm-2.5-7.21c.69-.83 1.15-1.99 1.02-3.14-.99.04-2.18.66-2.89 1.5-.64.73-1.2 1.9-1.05 3.04 1.1.08 2.23-.56 2.92-1.4z"/></svg>
              {t('auth.continueWithApple')}
            </FButton>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16, color: FG.dim, fontSize: 13 }}>
            {t('auth.noAccount')}{' '}
            <Link href="/register" style={{ color: FG.accent, fontWeight: 600, textDecoration: 'none' }}>
              {t('auth.register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
