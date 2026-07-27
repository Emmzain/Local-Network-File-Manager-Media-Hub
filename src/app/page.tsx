'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, Shield, Wifi, Send, QrCode,
  ArrowRight, Upload, Smartphone, Monitor,
  Lock, CloudOff, Gauge
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
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
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
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
        </motion.div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="features-section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
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
          viewport={{ once: true, margin: '-100px' }}
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
      <section style={{ padding: '4rem 1.5rem 6rem', textAlign: 'center' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
        >
          <motion.h2 variants={fadeUp} className="section-title" style={{ fontSize: '2rem' }}>
            Ready to Share?
          </motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle">
            Start transferring files in seconds. No setup required.
          </motion.p>
          <motion.div variants={fadeUp} className="hero-buttons" style={{ marginTop: '1rem' }}>
            <Link href="/send" className="glass-btn glass-btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
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
