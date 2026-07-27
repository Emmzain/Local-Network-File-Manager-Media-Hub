import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

export const metadata: Metadata = {
  title: 'EZShare — Instant P2P File Transfer Engine',
  description: 'Share files instantly between devices. No apps, no accounts, no uploads. Direct peer-to-peer transfer via WebRTC — fast, secure, and private.',
  keywords: ['file sharing', 'P2P', 'WebRTC', 'AirDrop alternative', 'nearby share', 'transfer files'],
  authors: [{ name: 'EZShare' }],
  openGraph: {
    title: 'EZShare — Instant P2P File Transfer Engine',
    description: 'Share files instantly between devices. Fast, secure, peer-to-peer.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#080c14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <SmoothScrollProvider>
            {/* Ambient Animated Gradient Backdrop */}
            <div className="bg-effects">
              <div className="bg-aura aura-emerald" />
              <div className="bg-aura aura-cyan" />
            </div>

            {children}
          </SmoothScrollProvider>
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
