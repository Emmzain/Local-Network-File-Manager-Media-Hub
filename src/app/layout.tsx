import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'EZShare — Awwwards Grade P2P File Transfer Engine',
  description: 'Share files instantly between devices. No apps, no accounts, no uploads. Direct peer-to-peer transfer via WebRTC — fast, secure, and private.',
  keywords: ['file sharing', 'P2P', 'WebRTC', 'AirDrop alternative', 'nearby share', 'transfer files'],
  authors: [{ name: 'EZShare' }],
  openGraph: {
    title: 'EZShare — Awwwards Grade P2P File Transfer Engine',
    description: 'Share files instantly between devices. Fast, secure, peer-to-peer.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#050505',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          {/* Ambient Aura Background */}
          <div className="bg-effects">
            <div className="bg-aura aura-violet" />
            <div className="bg-aura aura-pink" />
            <div className="bg-aura aura-gold" />
            <div className="bg-grid-awwwards" />
          </div>

          {children}
        </ThemeProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
