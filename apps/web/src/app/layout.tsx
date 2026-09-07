import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/app-context';
import Shell from '@/components/Shell';
import SwRegister from '@/components/SwRegister';

export const metadata: Metadata = {
  title: 'Tojmot — Тожмот',
  description: 'Tojmot (Тожмот) — o‘zbek aql gimnastikasi o‘yini. Play online against the computer or a friend.',
  manifest: './manifest.json',
  icons: {
    icon: [{ url: './favicon.ico' }, { url: './icon-192.png', type: 'image/png', sizes: '192x192' }],
    apple: [{ url: './apple-touch-icon.png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2ede1' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1a14' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="min-h-full" suppressHydrationWarning>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
        <SwRegister />
      </body>
    </html>
  );
}
