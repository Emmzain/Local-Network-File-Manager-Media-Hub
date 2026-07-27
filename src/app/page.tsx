'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, Shield, Wifi, Send, QrCode,
  ArrowRight, Upload, Smartphone, Monitor,
  Lock, CloudOff, Gauge, Terminal, CheckCircle2, Cpu
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function HomePage() {
  return (
    <div className="page-container">
      <Header />

      {/* ─── Hero Section ─── */}
      <section className="hero">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="hero-grid"
        >
          {/* Left Column - Hero Content */}
          <div className="hero-content">
            <motion.div variants={fadeUp} custom={0} className="hero-badge">
              <span className="hero-badge-dot" />
              Peer-to-Peer • No Server Storage
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="hero-title">
              Share Files{' '}
              <span className="gradient-text">Instantly</span>
              <br />
              Between Devices
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="hero-subtitle">
              No apps to install. No accounts to create. No file size limits.
              Just open the link, scan, and transfer — direct device-to-device.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="hero-buttons">
              <Link href="/send" className="glass-btn glass-btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                <Send size={18} />
                Send Files
                <ArrowRight size={16} />
              </Link>
              <Link href="/receive" className="glass-btn glass-btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                <QrCode size={18} />
                Receive Files
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">P2P</div>
                <div className="hero-stat-label">Direct Transfer</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">E2E</div>
                <div className="hero-stat-label">Encrypted</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">0</div>
                <div className="hero-stat-label">Server Storage</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">∞</div>
                <div className="hero-stat-label">File Size</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Greptile Interactive Code/Status Preview */}
          <motion.div variants={fadeUp} custom={3} className="hero-preview-wrapper">
            <div className="hero-terminal-card glass-card">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="terminal-title">
                  <Terminal size={13} style={{ display: 'inline', marginRight: 6 }} />
                  webrtc-p2p-engine.ts
                </div>
                <div className="terminal-badge">LIVE</div>
              </div>

              <div className="terminal-body">
                <div className="terminal-line">
                  <span className="code-keyword">const</span> <span className="code-var">session</span> = <span className="code-func">createWebRTCSession</span>(&#123;
                </div>
                <div className="terminal-line indent">
                  <span className="code-prop">protocol</span>: <span className="code-string">&apos;P2P-Direct&apos;</span>,
                </div>
                <div className="terminal-line indent">
                  <span className="code-prop">encryption</span>: <span className="code-string">&apos;AES-GCM-256&apos;</span>,
                </div>
                <div className="terminal-line indent">
                  <span className="code-prop">serverStorage</span>: <span className="code-number">0</span>,
                </div>
                <div className="terminal-line">
                  &#125;);
                </div>

                <div className="terminal-divider" />

                <div className="terminal-status-box">
                  <div className="status-row">
                    <span className="status-indicator active" />
                    <span className="status-text">Peer-to-Peer DataChannel Ready</span>
                  </div>
                  <div className="transfer-bar-mini">
                    <div className="transfer-fill-mini" />
                  </div>
                  <div className="status-meta">
                    <span>Speed: <strong>128 MB/s</strong> (Local Network)</span>
                    <span>Latency: <strong>&lt; 1ms</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="features-section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="section-title">
            Why EZShare?
          </motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle" style={{ marginTop: '1rem' }}>
            Everything you need for seamless file sharing, nothing you don&apos;t.
          </motion.p>

          <motion.div className="features-grid" variants={stagger}>
            <motion.div variants={fadeUp} className="glass-card feature-card">
              <div className="feature-icon feature-icon-purple">
                <Zap size={22} />
              </div>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-desc">
                Direct peer-to-peer transfer via WebRTC. No upload to server, no waiting. Files go straight from your device to theirs.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-card feature-card">
              <div className="feature-icon feature-icon-green">
                <Shield size={22} />
              </div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-desc">
                End-to-end encrypted transfers. Your files never touch our servers. One-time sessions expire automatically.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-card feature-card">
              <div className="feature-icon feature-icon-blue">
                <CloudOff size={22} />
              </div>
              <h3 className="feature-title">No Cloud Storage</h3>
              <p className="feature-desc">
                Zero server storage. Files transfer directly between devices. Nothing is saved, cached, or logged anywhere.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-card feature-card">
              <div className="feature-icon feature-icon-pink">
                <Smartphone size={22} />
              </div>
              <h3 className="feature-title">Any Device</h3>
              <p className="feature-desc">
                Works on any device with a browser — phones, tablets, laptops, desktops. No app install required.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-card feature-card">
              <div className="feature-icon feature-icon-purple">
                <Lock size={22} />
              </div>
              <h3 className="feature-title">No Accounts</h3>
              <p className="feature-desc">
                No sign-up, no login, no passwords. Just open the link and start sharing. It&apos;s that simple.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-card feature-card">
              <div className="feature-icon feature-icon-green">
                <Gauge size={22} />
              </div>
              <h3 className="feature-title">No File Limits</h3>
              <p className="feature-desc">
                Transfer files of any size. Photos, videos, documents, APKs — everything works with real-time progress tracking.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── How It Works Section ─── */}
      <section className="how-section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="section-title">
            How It Works
          </motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle" style={{ marginTop: '1rem' }}>
            Three simple steps. No complexity, no friction.
          </motion.p>

          <div className="steps-container">
            <motion.div variants={fadeUp} className="glass-card step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Open & Generate</h3>
                <p className="step-desc">
                  Open EZShare on the sender device. Click &quot;Send Files&quot; to generate a unique QR code and session code.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-card step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Scan & Connect</h3>
                <p className="step-desc">
                  Open EZShare on the receiver device. Scan the QR code or enter the 6-digit session code to establish a direct P2P connection.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-card step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Drop & Transfer</h3>
                <p className="step-desc">
                  Drag and drop your files. They transfer instantly — direct from your device to theirs with a real-time progress bar.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="cta-section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="cta-card glass-card"
        >
          <motion.h2 variants={fadeUp} className="section-title" style={{ fontSize: '2rem' }}>
            Ready to Share?
          </motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle">
            Start transferring files in seconds. No setup required.
          </motion.p>
          <motion.div variants={fadeUp} className="hero-buttons" style={{ marginTop: '1.25rem' }}>
            <Link href="/send" className="glass-btn glass-btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
              <Upload size={18} />
              Start Sharing
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
