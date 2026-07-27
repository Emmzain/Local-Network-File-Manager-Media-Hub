'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { WebRTCManager, TransferProgress, FileMetadata, getDeviceName } from '@/lib/webrtc';
import { SignalingClient } from '@/lib/signaling';

export type ConnectionStatus = 'idle' | 'connecting' | 'waiting' | 'connected' | 'disconnected' | 'error';

interface PeerInfo {
  name: string;
  type: string;
}

interface ReceivedFile {
  metadata: FileMetadata;
  blob: Blob;
  url: string;
}

interface UseTransferReturn {
  // Connection
  status: ConnectionStatus;
  sessionCode: string | null;
  peerInfo: PeerInfo | null;
  error: string | null;

  // Actions
  createSession: () => void;
  joinSession: (code: string) => void;
  disconnect: () => void;

  // File transfer
  sendFiles: (files: File[]) => void;
  sendProgress: Map<string, TransferProgress>;
  receiveProgress: Map<string, TransferProgress>;
  receivedFiles: ReceivedFile[];
  downloadFile: (file: ReceivedFile) => void;
}

// Auto-detect signaling server URL based on current domain/IP
const getSignalingUrl = () => {
  if (process.env.NEXT_PUBLIC_SIGNALING_URL) {
    return process.env.NEXT_PUBLIC_SIGNALING_URL;
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const hostname = window.location.hostname;
    // In local dev, socket server is on port 3001
    return `${protocol}//${hostname}:3001`;
  }
  return '';
};

export function useTransfer(): UseTransferReturn {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [peerInfo, setPeerInfo] = useState<PeerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendProgress, setSendProgress] = useState<Map<string, TransferProgress>>(new Map());
  const [receiveProgress, setReceiveProgress] = useState<Map<string, TransferProgress>>(new Map());
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);

  const signalingRef = useRef<SignalingClient | null>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const isInitiatorRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      webrtcRef.current?.disconnect();
      signalingRef.current?.disconnect();
    };
  }, []);

  const setupWebRTCHandlers = useCallback((rtc: WebRTCManager) => {
    rtc.on('connected', () => {
      setStatus('connected');
      setError(null);
    });

    rtc.on('disconnected', () => {
      setStatus('disconnected');
    });

    rtc.on('channel-open', () => {
      setStatus('connected');
    });

    rtc.on('send-progress', (progress: TransferProgress) => {
      setSendProgress(prev => {
        const next = new Map(prev);
        next.set(progress.fileId, progress);
        return next;
      });
    });

    rtc.on('file-start', (metadata: FileMetadata) => {
      setReceiveProgress(prev => {
        const next = new Map(prev);
        next.set(metadata.id, {
          fileId: metadata.id,
          fileName: metadata.name,
          fileSize: metadata.size,
          transferred: 0,
          percentage: 0,
          speed: 0,
          eta: 0,
          status: 'pending',
        });
        return next;
      });
    });

    rtc.on('file-progress', (progress: TransferProgress) => {
      setReceiveProgress(prev => {
        const next = new Map(prev);
        next.set(progress.fileId, progress);
        return next;
      });
    });

    rtc.on('file-received', ({ metadata, blob }: { metadata: FileMetadata; blob: Blob }) => {
      const url = URL.createObjectURL(blob);
      setReceivedFiles(prev => [...prev, { metadata, blob, url }]);
    });
  }, []);

  const createSession = useCallback(() => {
    setError(null);
    setStatus('connecting');
    isInitiatorRef.current = true;

    // Generate 6-char code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSessionCode(code);

    const signaling = new SignalingClient(getSignalingUrl());
    signalingRef.current = signaling;

    const rtc = new WebRTCManager();
    webrtcRef.current = rtc;
    setupWebRTCHandlers(rtc);

    const deviceName = getDeviceName();

    signaling.on('connected', () => {
      signaling.createRoom(code);
    });

    signaling.on('room-created', () => {
      setStatus('waiting');
    });

    signaling.on('peer-joined', async (data) => {
      setPeerInfo({ name: data.deviceName || 'Unknown Device', type: 'peer' });
      setStatus('connecting');

      // Create WebRTC offer
      const offer = await rtc.createOffer();
      signaling.sendOffer(offer);

      // Handle ICE candidates
      rtc.on('ice-candidate', (candidate) => {
        signaling.sendIceCandidate(candidate);
      });
    });

    signaling.on('answer', async (data) => {
      await rtc.handleAnswer(data.answer);
    });

    signaling.on('ice-candidate', async (data) => {
      await rtc.addIceCandidate(data.candidate);
    });

    signaling.on('peer-left', () => {
      setPeerInfo(null);
      setStatus('waiting');
    });

    signaling.on('error', (data) => {
      setError(data?.message || 'Connection error');
      setStatus('error');
    });

    signaling.connect(deviceName);
  }, [setupWebRTCHandlers]);

  const joinSession = useCallback((code: string) => {
    setError(null);
    setStatus('connecting');
    isInitiatorRef.current = false;

    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setSessionCode(cleanCode);

    const signaling = new SignalingClient(getSignalingUrl());
    signalingRef.current = signaling;

    const rtc = new WebRTCManager();
    webrtcRef.current = rtc;
    setupWebRTCHandlers(rtc);

    const deviceName = getDeviceName();

    signaling.on('connected', () => {
      signaling.joinRoom(cleanCode);
    });

    signaling.on('room-joined', (data) => {
      if (data.peerDeviceName) {
        setPeerInfo({ name: data.peerDeviceName, type: 'peer' });
      }
    });

    signaling.on('offer', async (data) => {
      const answer = await rtc.handleOffer(data.offer);
      signaling.sendAnswer(answer);

      rtc.on('ice-candidate', (candidate) => {
        signaling.sendIceCandidate(candidate);
      });
    });

    signaling.on('ice-candidate', async (data) => {
      await rtc.addIceCandidate(data.candidate);
    });

    signaling.on('peer-left', () => {
      setPeerInfo(null);
      setStatus('disconnected');
    });

    signaling.on('error', (data) => {
      setError(data?.message || 'Failed to join session');
      setStatus('error');
    });

    signaling.connect(deviceName);
  }, [setupWebRTCHandlers]);

  const disconnect = useCallback(() => {
    webrtcRef.current?.disconnect();
    signalingRef.current?.disconnect();
    webrtcRef.current = null;
    signalingRef.current = null;
    setStatus('idle');
    setSessionCode(null);
    setPeerInfo(null);
    setError(null);
    setSendProgress(new Map());
    setReceiveProgress(new Map());
  }, []);

  const sendFiles = useCallback((files: File[]) => {
    if (webrtcRef.current && status === 'connected') {
      webrtcRef.current.sendFiles(files);
    }
  }, [status]);

  const downloadFile = useCallback((file: ReceivedFile) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.metadata.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  return {
    status,
    sessionCode,
    peerInfo,
    error,
    createSession,
    joinSession,
    disconnect,
    sendFiles,
    sendProgress,
    receiveProgress,
    receivedFiles,
    downloadFile,
  };
}
