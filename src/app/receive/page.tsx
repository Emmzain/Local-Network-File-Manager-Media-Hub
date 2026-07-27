'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Keyboard, Wifi, WifiOff, X,
  Download, ArrowLeft, Loader2, Check,
  CheckCircle2, Camera, CameraOff,
  FileDown
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

function ReceiveContent() {
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  const isPinRequired = searchParams.get('pin') === 'required';

  const {
    status, sessionCode, peerInfo, error,
    joinSession, disconnect,
    receiveProgress, receivedFiles, downloadFile,
  } = useTransfer();

  const [inputCode, setInputCode] = useState('');
  const [mode, setMode] = useState<'choose' | 'scan' | 'code'>('choose');
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<any>(null);

  // Auto-join if code in URL (instant direct connect if PIN is not required)
  useEffect(() => {
    if (codeFromUrl && status === 'idle') {
      if (!isPinRequired) {
        joinSession(codeFromUrl);
      } else {
        // PIN required by sender settings: show code input prefilled
        setInputCode(codeFromUrl);
        setMode('code');
      }
    }
  }, [codeFromUrl, isPinRequired, status, joinSession]);

  const handleCodeSubmit = () => {
    const clean = inputCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length >= 4) {
      joinSession(clean);
    }
  };

  const startScanner = async () => {
    setMode('scan');
    setScannerActive(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-scanner-el');
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Parse the URL to get the code
          try {
            const url = new URL(decodedText);
            const code = url.searchParams.get('code');
            if (code) {
              scanner.stop();
              setScannerActive(false);
              joinSession(code);
            }
          } catch {
            // If not a URL, try as a raw code
            if (decodedText.length >= 4 && decodedText.length <= 8) {
              scanner.stop();
              setScannerActive(false);
              joinSession(decodedText);
            }
          }
        },
        () => { /* ignore scan failures */ }
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setScannerActive(false);
      setMode('code');
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
      } catch {}
      html5QrRef.current = null;
    }
    setScannerActive(false);
    setMode('choose');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        try { html5QrRef.current.stop(); } catch {}
      }
    };
  }, []);

  return (
    <div className="page-container">
      <Header />

      <div className="transfer-page">
        <div className="transfer-header">
          <Link href="/" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', marginBottom: '1rem' }}>
            <ArrowLeft size={14} /> Back
          </Link>
          <h1>
            <span className="gradient-text">Receive</span> Files
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Scan a QR code or enter a session code
          </p>
        </div>

        <div className="transfer-main">
          <AnimatePresence mode="wait">
            {/* ─── IDLE — Choose method ─── */}
            {status === 'idle' && !codeFromUrl && (
              <motion.div key="idle" variants={fadeUp} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mode === 'choose' && (
                  <>
                    <div
                      className="glass-card"
                      style={{ padding: '2rem', cursor: 'pointer', textAlign: 'center' }}
                      onClick={startScanner}
                    >
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 1rem',
                        background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Camera size={28} style={{ color: 'var(--accent-primary)' }} />
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Scan QR Code</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Use your camera to scan the QR code from the sender&apos;s device
                      </p>
                    </div>

                    <div className="divider">or</div>

                    <div
                      className="glass-card"
                      style={{ padding: '2rem', cursor: 'pointer', textAlign: 'center' }}
                      onClick={() => setMode('code')}
                    >
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 1rem',
                        background: 'rgba(6,214,160,0.12)', border: '1px solid rgba(6,214,160,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Keyboard size={28} style={{ color: 'var(--accent-secondary)' }} />
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Enter Code</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Type the 6-digit session code shown on the sender&apos;s screen
                      </p>
                    </div>
                  </>
                )}

                {/* Scanner view */}
                {mode === 'scan' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="scanner-container glass-card-static"
                  >
                    <div className="scanner-viewport" ref={scannerRef}>
                      <div id="qr-scanner-el" style={{ width: '100%', height: '100%' }} />
                      {scannerActive && (
                        <>
                          <div className="scan-line" />
                          <div className="scanner-corners" />
                          <div className="scanner-corners-bottom" />
                        </>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                      Point your camera at the QR code
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="glass-btn" onClick={stopScanner}>
                        <CameraOff size={14} /> Cancel
                      </button>
                      <button className="glass-btn glass-btn-secondary" onClick={() => { stopScanner(); setMode('code'); }}>
                        <Keyboard size={14} /> Enter Code
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Code entry */}
                {mode === 'code' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card-static"
                    style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}
                  >
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: 'rgba(6,214,160,0.12)', border: '1px solid rgba(6,214,160,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Keyboard size={28} style={{ color: 'var(--accent-secondary)' }} />
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Enter Session Code</h3>

                    <input
                      className="glass-input mono"
                      type="text"
                      placeholder="ABC123"
                      maxLength={6}
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
                      style={{
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        maxWidth: 250,
                      }}
                      autoFocus
                    />

                    <button
                      className="glass-btn glass-btn-secondary"
                      onClick={handleCodeSubmit}
                      disabled={inputCode.length < 4}
                      style={{ opacity: inputCode.length < 4 ? 0.5 : 1 }}
                    >
                      <Wifi size={16} /> Connect
                    </button>

                    <button
                      className="glass-btn"
                      onClick={() => setMode('choose')}
                      style={{ fontSize: '0.85rem' }}
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ─── CONNECTING ─── */}
            {status === 'connecting' && (
              <motion.div key="connecting" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <div className="glass-card-static" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <Loader2 size={40} style={{ color: 'var(--accent-primary)', animation: 'rotate-slow 1s linear infinite' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Connecting to session...</p>
                  {sessionCode && <span className="session-code">{sessionCode}</span>}
                </div>
              </motion.div>
            )}

            {/* ─── CONNECTED — Receiving ─── */}
            {status === 'connected' && (
              <motion.div key="connected" variants={fadeUp} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Connection info */}
                <div className="connection-card glass-card-static">
                  <div className="connection-avatar">
                    <Wifi size={20} />
                  </div>
                  <div className="connection-info">
                    <div className="connection-name">{peerInfo?.name || 'Connected Device'}</div>
                    <div className="connection-status">
                      <span className="status-dot status-dot-connected" />
                      Connected — Waiting for files
                    </div>
                  </div>
                  <button className="glass-btn glass-btn-icon glass-btn-danger" onClick={disconnect} title="Disconnect">
                    <WifiOff size={16} />
                  </button>
                </div>

                {/* Waiting for files */}
                {receivedFiles.length === 0 && receiveProgress.size === 0 && (
                  <div className="glass-card-static" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div className="animate-float">
                      <FileDown size={48} style={{ color: 'var(--accent-primary)', opacity: 0.5 }} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      Waiting for the sender to drop files...
                    </p>
                  </div>
                )}

                {/* Receive progress */}
                {receiveProgress.size > 0 && (
                  <div className="file-list">
                    {Array.from(receiveProgress.values()).map((p) => (
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
                                <Check size={10} /> Received
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

                {/* Received files */}
                {receivedFiles.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                      Received Files
                    </h3>
                    <div className="file-list">
                      {receivedFiles.map((file, i) => (
                        <div key={i} className="file-item glass-card-static">
                          <div className="file-icon">{getFileIcon(file.metadata.type)}</div>
                          <div className="file-info">
                            <div className="file-name">{file.metadata.name}</div>
                            <div className="file-size">{formatFileSize(file.metadata.size)}</div>
                          </div>
                          <button
                            className="glass-btn glass-btn-secondary"
                            onClick={() => downloadFile(file)}
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                          >
                            <Download size={14} /> Save
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── ERROR ─── */}
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
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Connection Failed</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
                  <button className="glass-btn glass-btn-primary" onClick={() => { disconnect(); setMode('choose'); }}>
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── DISCONNECTED ─── */}
            {status === 'disconnected' && (
              <motion.div key="disconnected" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <div className="glass-card-static" style={{ padding: '2.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <WifiOff size={36} style={{ color: 'var(--text-tertiary)' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Disconnected</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>The sender has disconnected.</p>

                  {/* Still show download buttons for received files */}
                  {receivedFiles.length > 0 && (
                    <div style={{ width: '100%', marginTop: '1rem' }}>
                      <div className="file-list">
                        {receivedFiles.map((file, i) => (
                          <div key={i} className="file-item glass-card-static">
                            <div className="file-icon">{getFileIcon(file.metadata.type)}</div>
                            <div className="file-info">
                              <div className="file-name">{file.metadata.name}</div>
                              <div className="file-size">{formatFileSize(file.metadata.size)}</div>
                            </div>
                            <button
                              className="glass-btn glass-btn-secondary"
                              onClick={() => downloadFile(file)}
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              <Download size={14} /> Save
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button className="glass-btn glass-btn-primary" onClick={() => { disconnect(); setMode('choose'); }}>
                    New Connection
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

export default function ReceivePage() {
  return (
    <Suspense fallback={
      <div className="page-container">
        <Header />
        <div className="transfer-page">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
            <Loader2 size={40} style={{ color: 'var(--accent-primary)', animation: 'rotate-slow 1s linear infinite' }} />
          </div>
        </div>
      </div>
    }>
      <ReceiveContent />
    </Suspense>
  );
}
