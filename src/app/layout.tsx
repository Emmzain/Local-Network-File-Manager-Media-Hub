import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EZShare — Instant P2P File Sharing',
  description: 'Share files instantly between devices. No apps, no accounts, no uploads. Direct peer-to-peer transfer via WebRTC — fast, secure, and private.',
  keywords: ['file sharing', 'P2P', 'WebRTC', 'AirDrop alternative', 'nearby share', 'transfer files'],
  authors: [{ name: 'EZShare' }],
  openGraph: {
    title: 'EZShare — Instant P2P File Sharing',
    description: 'Share files instantly between devices. Fast, secure, peer-to-peer.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a1a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {/* Background Effects */}
        <div className="bg-effects">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
          <div className="bg-grid" />
        </div>

        {children}

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
