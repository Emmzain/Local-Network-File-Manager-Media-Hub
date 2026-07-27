'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, Shield, Wifi, Send, QrCode,
  ArrowRight, Upload, Smartphone, Monitor,
  Lock, CloudOff, Gauge, Terminal, CheckCircle2,
  Cpu, Radio, Sparkles, ShieldCheck
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
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
    <div className="page-wrapper">
      <Header />

      {/* ─── Hero Section ─── */}
      <section className="hero-section">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="hero-container"
        >
          {/* Unique Minimalist Tech Capsule Tag - Dot Removed */}
          <motion.div variants={fadeUp} custom={0} className="badge-chip">
            <ShieldCheck size={14} className="badge-icon" />
            <span>Peer-to-Peer • No Server Storage</span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} className="hero-heading">
            Share Files{' '}
            <span className="hero-gradient-mask">Instantly</span>
            <br />
            Between Devices
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="hero-lead">
            No apps to install. No accounts to create. No file size limits.
            Just open the link, scan, and transfer — direct device-to-device.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="hero-action-buttons">
            <Link href="/send" className="btn-action btn-cyan">
              <Send size={18} />
              <span>Send Files</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/receive" className="btn-action btn-glass">
              <QrCode size={18} />
              <span>Receive Files</span>
            </Link>
          </motion.div>

          {/* Interactive P2P Transfer Dock Capsule */}
          <motion.div variants={fadeUp} custom={4} className="hero-transfer-dock">
            <div className="dock-card">
              <div className="dock-header">
                <div className="dock-title-group">
                  <Radio size={15} className="pulse-cyan" />
                  <span>P2P Encrypted Channel</span>
                </div>
                <div className="dock-tag">WEBRTC DIRECT</div>
              </div>

              <div className="dock-body">
                <div className="dock-nodes">
                  <div className="node-box">
                    <Monitor size={20} className="node-icon" />
                    <span>Sender</span>
                  </div>
                  <div className="node-wave-container">
                    <div className="wave-line" />
                    <div className="wave-pulse" />
                  </div>
                  <div className="node-box">
                    <Smartphone size={20} className="node-icon" />
                    <span>Receiver</span>
                  </div>
                </div>

                <div className="dock-stats-grid">
                  <div className="dock-stat-item">
                    <span className="stat-value">P2P</span>
                    <span className="stat-label">Direct Transfer</span>
                  </div>
                  <div className="dock-stat-item">
                    <span className="stat-value">E2E</span>
                    <span className="stat-label">Encrypted</span>
                  </div>
                  <div className="dock-stat-item">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Server Storage</span>
                  </div>
                  <div className="dock-stat-item">
                    <span className="stat-value">∞</span>
                    <span className="stat-label">File Size</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Features Section (Bento Grid) ─── */}
      <section className="bento-features-section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="bento-container"
        >
          <motion.h2 variants={fadeUp} className="bento-title">
            Why EZShare?
          </motion.h2>
          <motion.p variants={fadeUp} className="bento-subtitle">
            Everything you need for seamless file sharing, nothing you don&apos;t.
          </motion.p>

          <motion.div className="bento-grid" variants={stagger}>
            <motion.div variants={fadeUp} className="bento-card bento-wide">
              <div className="bento-icon-wrapper">
                <Zap size={24} />
              </div>
              <h3 className="bento-card-title">Lightning Fast</h3>
              <p className="bento-card-desc">
                Direct peer-to-peer transfer via WebRTC. No upload to server, no waiting. Files go straight from your device to theirs.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="bento-card">
              <div className="bento-icon-wrapper">
                <Shield size={24} />
              </div>
              <h3 className="bento-card-title">Secure & Private</h3>
              <p className="bento-card-desc">
                End-to-end encrypted transfers. Your files never touch our servers. One-time sessions expire automatically.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="bento-card">
              <div className="bento-icon-wrapper">
                <CloudOff size={24} />
              </div>
              <h3 className="bento-card-title">No Cloud Storage</h3>
              <p className="bento-card-desc">
                Zero server storage. Files transfer directly between devices. Nothing is saved, cached, or logged anywhere.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="bento-card">
              <div className="bento-icon-wrapper">
                <Smartphone size={24} />
              </div>
              <h3 className="bento-card-title">Any Device</h3>
              <p className="bento-card-desc">
                Works on any device with a browser — phones, tablets, laptops, desktops. No app install required.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="bento-card">
              <div className="bento-icon-wrapper">
                <Lock size={24} />
              </div>
              <h3 className="bento-card-title">No Accounts</h3>
              <p className="bento-card-desc">
                No sign-up, no login, no passwords. Just open the link and start sharing. It&apos;s that simple.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="bento-card bento-wide">
              <div className="bento-icon-wrapper">
                <Gauge size={24} />
              </div>
              <h3 className="bento-card-title">No File Limits</h3>
              <p className="bento-card-desc">
                Transfer files of any size. Photos, videos, documents, APKs — everything works with real-time progress tracking.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── How It Works Section (Horizontal Stepper) ─── */}
      <section className="pipeline-section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="pipeline-container"
        >
          <motion.h2 variants={fadeUp} className="bento-title">
            How It Works
          </motion.h2>
          <motion.p variants={fadeUp} className="bento-subtitle">
            Three simple steps. No complexity, no friction.
          </motion.p>

          <div className="pipeline-flow">
            <motion.div variants={fadeUp} className="pipeline-card">
              <div className="pipeline-num">01</div>
              <h3 className="pipeline-title">Open & Generate</h3>
              <p className="pipeline-desc">
                Open EZShare on the sender device. Click &quot;Send Files&quot; to generate a unique QR code and session code.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="pipeline-card">
              <div className="pipeline-num">02</div>
              <h3 className="pipeline-title">Scan & Connect</h3>
              <p className="pipeline-desc">
                Open EZShare on the receiver device. Scan the QR code or enter the 6-digit session code to establish a direct P2P connection.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="pipeline-card">
              <div className="pipeline-num">03</div>
              <h3 className="pipeline-title">Drop & Transfer</h3>
              <p className="pipeline-desc">
                Drag and drop your files. They transfer instantly — direct from your device to theirs with a real-time progress bar.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="action-cta-section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="cta-glow-capsule"
        >
          <motion.h2 variants={fadeUp} className="bento-title" style={{ fontSize: '2.2rem' }}>
            Ready to Share?
          </motion.h2>
          <motion.p variants={fadeUp} className="bento-subtitle">
            Start transferring files in seconds. No setup required.
          </motion.p>
          <motion.div variants={fadeUp} style={{ marginTop: '1.5rem' }}>
            <Link href="/send" className="btn-action btn-cyan" style={{ padding: '14px 38px', fontSize: '1rem' }}>
              <Upload size={18} />
              <span>Start Sharing</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
