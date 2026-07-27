'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Send, QrCode, Sun, Moon, Activity } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header-floating">
      <div className="header-capsule">
        <Link href="/" className="header-brand">
          <Image
            src="/Nav.png"
            alt="EZShare"
            width={140}
            height={36}
            unoptimized
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        <nav className="header-navigation">
          <Link
            href="/send"
            className={`nav-tab ${pathname === '/send' ? 'active' : ''}`}
          >
            <Send size={14} />
            <span>Send</span>
          </Link>
          <Link
            href="/receive"
            className={`nav-tab ${pathname === '/receive' ? 'active' : ''}`}
          >
            <QrCode size={14} />
            <span>Receive</span>
          </Link>
        </nav>

        <div className="header-actions">
          <div className="ping-status-badge">
            <span className="ping-pulse" />
            <Activity size={13} />
            <span className="ping-label">WebRTC Direct</span>
          </div>

          <button
            onClick={toggleTheme}
            className="theme-switch"
            title={`Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
