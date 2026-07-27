import { ShieldCheck, Cpu, Lock } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="footer-modern">
      <div className="footer-capsule-grid">
        <div className="footer-col-brand">
          <div className="brand-mark-mini">
            <Image src="/Nav.png" alt="EZShare" width={110} height={28} unoptimized className="brand-logo-nav" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <p className="footer-summary">
            Direct Peer-to-Peer local file sharing engine. E2E Encrypted &amp; zero server caching.
          </p>
        </div>

        <div className="footer-col-chips">
          <div className="chip-item"><ShieldCheck size={13} /> End-to-End Encrypted</div>
          <div className="chip-item"><Cpu size={13} /> Zero Cloud Storage</div>
          <div className="chip-item"><Lock size={13} /> Ephemeral Sessions</div>
        </div>
      </div>

      <div className="footer-legal-bar">
        <p>Built with ❤️ — <strong>EZShare</strong> • Fast • Secure • P2P</p>
        <p>No files are stored on any server. All transfers are direct device-to-device.</p>
      </div>
    </footer>
  );
}
