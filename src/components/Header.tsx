'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Send, QrCode, Zap, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <Link href="/" className="header-logo">
        <div className="header-logo-icon">
          <Zap size={18} />
        </div>
        <div className="header-brand-info">
          <span className="header-logo-text">EZShare</span>
          <span className="header-logo-sub">P2P Network</span>
        </div>
      </Link>

      <nav className="header-nav">
        <Link
          href="/send"
          className={`nav-item ${pathname === '/send' ? 'active' : ''}`}
        >
          <Send size={15} />
          <span>Send</span>
        </Link>
        <Link
          href="/receive"
          className={`nav-item ${pathname === '/receive' ? 'active' : ''}`}
        >
          <QrCode size={15} />
          <span>Receive</span>
        </Link>
      </nav>

      <div className="header-actions">
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="header-badge-status">
          <ShieldCheck size={14} className="status-icon" />
          <span className="status-text-desktop">WebRTC Direct</span>
        </div>
      </div>
    </header>
  );
}
