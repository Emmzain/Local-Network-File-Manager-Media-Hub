'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Send, QrCode, Zap, ShieldCheck } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <Link href="/" className="header-logo">
        <div className="header-logo-icon">
          <Zap size={18} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
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

      <div className="header-badge-status">
        <ShieldCheck size={14} className="status-icon" />
        <span>WebRTC Direct</span>
      </div>
    </header>
  );
}
