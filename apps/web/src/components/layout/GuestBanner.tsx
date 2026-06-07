'use client';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FG } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

export function GuestBanner() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  if (!user?.isAnonymous) return null;

  return (
    <div style={{
      background: 'rgba(249,115,22,0.10)',
      borderBottom: `1px solid rgba(249,115,22,0.25)`,
      padding: '8px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 13, color: FG.mid }}>
        {t('auth.guestBanner')}
      </span>
      <Link
        href="/register"
        style={{
          fontSize: 13, fontWeight: 600, color: FG.accent,
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}
      >
        {t('auth.saveProgress')} →
      </Link>
    </div>
  );
}
