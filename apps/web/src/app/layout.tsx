import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Forge — Natural Fitness',
  description: 'Train, eat, and track progress without shortcuts. Built for lifters who do it clean.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <I18nProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1A2233',
                  color: '#E6EAF2',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                },
              }}
            />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
