'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Send, QrCode, Zap } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <Link href="/" className="header-logo">
        <div className="header-logo-icon">
          <Zap size={18} />
        </div>
        <span>EZShare</span>
      </Link>

      <nav className="header-nav">
        <Link
          href="/send"
          className={pathname === '/send' ? 'active' : ''}
        >
          <Send size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          <span>Send</span>
        </Link>
        <Link
          href="/receive"
          className={pathname === '/receive' ? 'active' : ''}
        >
          <QrCode size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          <span>Receive</span>
        </Link>
      </nav>
    </header>
  );
}
