'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Upload, Copy, Check, Wifi, WifiOff,
  File, X, Send, ArrowLeft, Loader2,
  CheckCircle2, Clock, ShieldCheck, ShieldOff, Settings
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTransfer } from '@/hooks/useTransfer';
import { formatFileSize, formatSpeed, formatETA, getFileIcon } from '@/lib/webrtc';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export default function SendPage() {
  const {
    status, sessionCode, peerInfo, error,
    createSession, disconnect,
    sendFiles, sendProgress,
    receiveProgress, receivedFiles, downloadFile,
  } = useTransfer();

  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [requireCode, setRequireCode] = useState(false); // default code not required unless toggled
  const [selectedPort, setSelectedPort] = useState('3000');
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Instant session creation on mount
  useEffect(() => {
    if (status === 'idle') {
      createSession();
    }
  }, [status, createSession]);

  const handleCopyCode = useCallback(() => {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [sessionCode]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSend = useCallback(() => {
    if (selectedFiles.length > 0 && status === 'connected') {
      sendFiles(selectedFiles);
      setSelectedFiles([]);
    }
  }, [selectedFiles, status, sendFiles]);

  const [copiedLink, setCopiedLink] = useState(false);

  // Compute full shareable URL
  const getShareableUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    let origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '192.168.1.17' : window.location.hostname;
      origin = `http://${host}:${selectedPort}`;
    }
    const codeParam = requireCode ? `&pin=required` : '';
    return `${origin}/receive?code=${sessionCode}${codeParam}`;
  }, [sessionCode, selectedPort, requireCode]);

  const shareableUrl = getShareableUrl();

  const handleCopyLink = useCallback(() => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }, [shareableUrl]);

  return (
    <div className="page-container">
      <Header />

      <div className="transfer-page">
        <div className="transfer-header">
          <Link href="/" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back
          </Link>
          <h1>
            <span className="gradient-text">Send</span> Files
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Instant direct connection — drag & drop to share
          </p>

          {/* Quick Settings Control Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 14 }}>
            <button
              className={`glass-btn ${requireCode ? 'glass-btn-primary' : ''}`}
              onClick={() => setRequireCode(!requireCode)}
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              {requireCode ? <ShieldCheck size={14} style={{ color: 'var(--accent-secondary)' }} /> : <ShieldOff size={14} />}
              {requireCode ? 'Require PIN Code: ON' : 'Direct Join (No PIN)'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '9999px', padding: '6px 14px', fontSize: '0.8rem' }}>
              <Settings size={13} style={{ color: 'var(--text-tertiary)' }} />
              <span style={{ color: 'var(--text-tertiary)' }}>Port:</span>
              <select
                value={selectedPort}
                onChange={(e) => setSelectedPort(e.target.value)}
                style={{
                  background: 'transparent',
                  color: 'var(--accent-primary)',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <option value="3000" style={{ background: '#0a0a1a', color: '#fff' }}>3000 (Default)</option>
                <option value="3001" style={{ background: '#0a0a1a', color: '#fff' }}>3001</option>
                <option value="8080" style={{ background: '#0a0a1a', color: '#fff' }}>8080</option>
                <option value="5000" style={{ background: '#0a0a1a', color: '#fff' }}>5000</option>
              </select>
            </div>
          </div>
        </div>

        <div className="transfer-main">
          <AnimatePresence mode="wait">
            {/* ─── IDLE STATE ─── */}
            {status === 'idle' && (
              <motion.div key="idle" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <div className="glass-card-static" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,214,160,0.1))',
                    border: '1px solid rgba(139,92,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Send size={32} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Ready to Send</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Create a session to generate a QR code that the receiver can scan to connect.
                    </p>
                  </div>
                  <button
                    className="glass-btn glass-btn-primary"
                    onClick={createSession}
                    style={{ padding: '14px 36px', fontSize: '1rem' }}
                  >
                    <Wifi size={18} />
                    Create Session
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── CONNECTING STATE ─── */}
            {status === 'connecting' && (
              <motion.div key="connecting" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <div className="glass-card-static" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <Loader2 size={40} style={{ color: 'var(--accent-primary)', animation: 'rotate-slow 1s linear infinite' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Establishing connection...</p>
                </div>
              </motion.div>
            )}

            {/* ─── WAITING STATE — Show QR ─── */}
            {status === 'waiting' && sessionCode && (
              <motion.div key="waiting" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <div className="qr-container glass-card-static">
                  <div className="glass-badge glass-badge-warning">
                    <Clock size={12} />
                    Waiting for device...
                  </div>

                  <div className="qr-frame">
                    <QRCodeSVG
                      value={shareableUrl}
                      size={200}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#0a0a1a"
                      style={{ display: 'block' }}
                    />
                  </div>

                  <div style={{ textAlign: 'center', width: '100%', maxWidth: 420 }}>
                    <p className="qr-label">Scan QR or enter 6-digit code on mobile</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, marginBottom: 16 }}>
                      <span className="session-code">{sessionCode}</span>
                      <button
                        className="glass-btn glass-btn-icon"
                        onClick={handleCopyCode}
                        title="Copy code"
                      >
                        {copied ? <Check size={16} style={{ color: 'var(--accent-secondary)' }} /> : <Copy size={16} />}
                      </button>
                    </div>

                    {/* Direct IP / Link for other devices */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      fontSize: '0.82rem',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Open this URL on recipient device:
                        </span>
                        <span className="mono" style={{ color: 'var(--accent-secondary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                          {shareableUrl}
                        </span>
                      </div>
                      <button
                        className="glass-btn glass-btn-icon"
                        onClick={handleCopyLink}
                        title="Copy direct link"
                        style={{ padding: 6, flexShrink: 0 }}
                      >
                        {copiedLink ? <Check size={14} style={{ color: 'var(--accent-secondary)' }} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', maxWidth: 300, textAlign: 'center' }}>
                    Open EZShare on the other device and scan this QR code or enter the session code
                  </p>

                  <button className="glass-btn glass-btn-danger" onClick={disconnect} style={{ fontSize: '0.85rem' }}>
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── CONNECTED STATE — File Transfer ─── */}
            {status === 'connected' && (
              <motion.div key="connected" variants={fadeUp} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Connected device */}
                <div className="connection-card glass-card-static">
                  <div className="connection-avatar">
                    <Wifi size={20} />
                  </div>
                  <div className="connection-info">
                    <div className="connection-name">{peerInfo?.name || 'Connected Device'}</div>
                    <div className="connection-status">
                      <span className="status-dot status-dot-connected" />
                      Connected via P2P
                    </div>
                  </div>
                  <button className="glass-btn glass-btn-icon glass-btn-danger" onClick={disconnect} title="Disconnect">
                    <WifiOff size={16} />
                  </button>
                </div>

                {/* Drop zone */}
                <div
                  className={`drop-zone glass-card-static ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="drop-zone-icon">
                    <Upload size={28} />
                  </div>
                  <div className="drop-zone-text">
                    <p className="drop-zone-title">Drag & Drop Files Here</p>
                    <p className="drop-zone-subtitle">or click to browse • any file type</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Selected files */}
                {selectedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="file-list"
                  >
                    {selectedFiles.map((file, i) => (
                      <div key={i} className="file-item glass-card-static">
                        <div className="file-icon">{getFileIcon(file.type)}</div>
                        <div className="file-info">
                          <div className="file-name">{file.name}</div>
                          <div className="file-size">{formatFileSize(file.size)}</div>
                        </div>
                        <button
                          className="glass-btn glass-btn-icon"
                          onClick={() => removeFile(i)}
                          style={{ padding: 6 }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    <button
                      className="glass-btn glass-btn-primary"
                      onClick={handleSend}
                      style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8 }}
                    >
                      <Send size={16} />
                      Send {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ({formatFileSize(selectedFiles.reduce((a, f) => a + f.size, 0))})
                    </button>
                  </motion.div>
                )}

                {/* Send progress */}
                {sendProgress.size > 0 && (
                  <div className="file-list">
                    {Array.from(sendProgress.values()).map((p) => (
                      <div key={p.fileId} className="glass-card-static" style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div className="file-icon">{getFileIcon('')}</div>
                          <div className="file-info">
                            <div className="file-name">{p.fileName}</div>
                            <div className="file-size">{formatFileSize(p.transferred)} / {formatFileSize(p.fileSize)}</div>
                          </div>
                          {p.status === 'completed' ? (
                            <CheckCircle2 size={20} style={{ color: 'var(--accent-secondary)' }} />
                          ) : (
                            <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                              {p.speed > 0 ? formatSpeed(p.speed) : ''}
                            </span>
                          )}
                        </div>
                        <div className="progress-container">
                          <div className="progress-header">
                            <span className="progress-percentage">{Math.round(p.percentage)}%</span>
                            {p.status !== 'completed' && p.eta > 0 && (
                              <span className="progress-stats">ETA: {formatETA(p.eta)}</span>
                            )}
                            {p.status === 'completed' && (
                              <span className="glass-badge glass-badge-success" style={{ fontSize: '0.7rem' }}>
                                <Check size={10} /> Sent
                              </span>
                            )}
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${p.percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── ERROR STATE ─── */}
            {status === 'error' && (
              <motion.div key="error" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <div className="glass-card-static" style={{ padding: '2.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <X size={28} style={{ color: 'var(--accent-danger)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Connection Error</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
                  <button className="glass-btn glass-btn-primary" onClick={createSession}>
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── DISCONNECTED STATE ─── */}
            {status === 'disconnected' && (
              <motion.div key="disconnected" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <div className="glass-card-static" style={{ padding: '2.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <WifiOff size={36} style={{ color: 'var(--text-tertiary)' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Disconnected</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>The peer has disconnected.</p>
                  <button className="glass-btn glass-btn-primary" onClick={createSession}>
                    New Session
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}
