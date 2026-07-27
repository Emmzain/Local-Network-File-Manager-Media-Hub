import { Zap, Shield, Cpu, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <Zap size={16} />
            <span>EZShare</span>
          </div>
          <p className="footer-desc">
            Direct Peer-to-Peer local file sharing engine. E2E Encrypted & zero server caching.
          </p>
        </div>

        <div className="footer-badges">
          <span className="footer-badge"><Shield size={13} /> End-to-End Encrypted</span>
          <span className="footer-badge"><Cpu size={13} /> Zero Cloud Storage</span>
          <span className="footer-badge"><Lock size={13} /> Ephemeral Sessions</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Built with ❤️ — <strong>EZShare</strong> • Fast • Secure • P2P</p>
        <p>No files are stored on any server. All transfers are direct device-to-device.</p>
      </div>
    </footer>
  );
}
