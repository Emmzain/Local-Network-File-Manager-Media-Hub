import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'EZShare — Next-Gen P2P File Sharing Engine',
  description: 'Share files instantly between devices. No apps, no accounts, no uploads. Direct peer-to-peer transfer via WebRTC — fast, secure, and private.',
  keywords: ['file sharing', 'P2P', 'WebRTC', 'AirDrop alternative', 'nearby share', 'transfer files'],
  authors: [{ name: 'EZShare' }],
  openGraph: {
    title: 'EZShare — Next-Gen P2P File Sharing Engine',
    description: 'Share files instantly between devices. Fast, secure, peer-to-peer.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#030712',
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
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fira+Code:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          {/* Background Ambient Mesh Grid */}
          <div className="bg-effects">
            <div className="bg-orb bg-orb-cyan" />
            <div className="bg-orb bg-orb-emerald" />
            <div className="bg-orb bg-orb-indigo" />
            <div className="bg-mesh-grid" />
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
