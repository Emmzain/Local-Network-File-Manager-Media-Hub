import { Zap, ShieldCheck, Cpu, Lock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-modern">
      <div className="footer-capsule-grid">
        <div className="footer-col-brand">
          <div className="brand-mark-mini">
            <Zap size={16} />
            <span>EZShare</span>
          </div>
          <p className="footer-summary">
            Direct Peer-to-Peer local file sharing engine. E2E Encrypted & zero server caching.
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
