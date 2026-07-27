/**
 * WebRTC Peer Connection Manager
 * Handles P2P connections and data channel communication for file transfer.
 */

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface TransferProgress {
  fileId: string;
  fileName: string;
  fileSize: number;
  transferred: number;
  percentage: number;
  speed: number; // bytes per second
  eta: number; // seconds remaining
  status: 'pending' | 'transferring' | 'completed' | 'error' | 'cancelled';
}

type MessageHandler = (data: any) => void;

const CHUNK_SIZE = 64 * 1024; // 64KB chunks
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.services.mozilla.com' },
];

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private onMessageHandlers: Map<string, MessageHandler[]> = new Map();
  private isInitiator: boolean = false;

  // Transfer state
  private sendQueue: { file: File; metadata: FileMetadata }[] = [];
  private isSending: boolean = false;
  private receiveBuffer: ArrayBuffer[] = [];
  private currentReceiveMetadata: FileMetadata | null = null;
  private receivedSize: number = 0;

  // Speed tracking
  private lastSpeedCheck: number = 0;
  private lastSpeedBytes: number = 0;

  constructor() {
    this.onMessageHandlers = new Map();
  }

  on(event: string, handler: MessageHandler) {
    if (!this.onMessageHandlers.has(event)) {
      this.onMessageHandlers.set(event, []);
    }
    this.onMessageHandlers.get(event)!.push(handler);
  }

  private emit(event: string, data?: any) {
    const handlers = this.onMessageHandlers.get(event) || [];
    handlers.forEach(h => h(data));
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    this.isInitiator = true;
    this.peerConnection = this.createPeerConnection();

    // Create data channel (only initiator creates it)
    this.dataChannel = this.peerConnection.createDataChannel('fileTransfer', {
      ordered: true,
    });
    this.setupDataChannel(this.dataChannel);

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    return offer;
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    this.isInitiator = false;
    this.peerConnection = this.createPeerConnection();

    // Listen for data channel from initiator
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel(this.dataChannel);
    };

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return answer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('ice-candidate', event.candidate.toJSON());
      }
    };

    pc.onconnectionstatechange = () => {
      this.emit('connection-state', pc.connectionState);
      if (pc.connectionState === 'connected') {
        this.emit('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.emit('disconnected');
      }
    };

    pc.oniceconnectionstatechange = () => {
      this.emit('ice-state', pc.iceConnectionState);
    };

    return pc;
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.binaryType = 'arraybuffer';

    channel.onopen = () => {
      this.emit('channel-open');
    };

    channel.onclose = () => {
      this.emit('channel-close');
    };

    channel.onerror = (e) => {
      this.emit('channel-error', e);
    };

    channel.onmessage = (event) => {
      this.handleDataChannelMessage(event);
    };
  }

  private handleDataChannelMessage(event: MessageEvent) {
    if (typeof event.data === 'string') {
      // Control message (JSON)
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'file-meta':
            this.handleFileMetadata(msg.data);
            break;
          case 'file-end':
            this.handleFileEnd(msg.data);
            break;
          case 'text':
            this.emit('text-received', msg.data);
            break;
          default:
            this.emit('message', msg);
        }
      } catch {
        this.emit('message', event.data);
      }
    } else {
      // Binary data — file chunk
      this.handleFileChunk(event.data as ArrayBuffer);
    }
  }

  private handleFileMetadata(metadata: FileMetadata) {
    this.currentReceiveMetadata = metadata;
    this.receiveBuffer = [];
    this.receivedSize = 0;
    this.lastSpeedCheck = Date.now();
    this.lastSpeedBytes = 0;

    this.emit('file-start', metadata);
  }

  private handleFileChunk(chunk: ArrayBuffer) {
    this.receiveBuffer.push(chunk);
    this.receivedSize += chunk.byteLength;

    if (this.currentReceiveMetadata) {
      const now = Date.now();
      const elapsed = (now - this.lastSpeedCheck) / 1000;
      let speed = 0;

      if (elapsed > 0.5) {
        speed = (this.receivedSize - this.lastSpeedBytes) / elapsed;
        this.lastSpeedCheck = now;
        this.lastSpeedBytes = this.receivedSize;
      }

      const remaining = this.currentReceiveMetadata.size - this.receivedSize;
      const eta = speed > 0 ? remaining / speed : 0;

      const progress: TransferProgress = {
        fileId: this.currentReceiveMetadata.id,
        fileName: this.currentReceiveMetadata.name,
        fileSize: this.currentReceiveMetadata.size,
        transferred: this.receivedSize,
        percentage: Math.min(100, (this.receivedSize / this.currentReceiveMetadata.size) * 100),
        speed,
        eta,
        status: 'transferring',
      };

      this.emit('file-progress', progress);
    }
  }

  private handleFileEnd(data: { id: string }) {
    if (this.currentReceiveMetadata && this.currentReceiveMetadata.id === data.id) {
      const blob = new Blob(this.receiveBuffer, { type: this.currentReceiveMetadata.type });
      
      this.emit('file-received', {
        metadata: this.currentReceiveMetadata,
        blob,
      });

      const progress: TransferProgress = {
        fileId: this.currentReceiveMetadata.id,
        fileName: this.currentReceiveMetadata.name,
        fileSize: this.currentReceiveMetadata.size,
        transferred: this.currentReceiveMetadata.size,
        percentage: 100,
        speed: 0,
        eta: 0,
        status: 'completed',
      };

      this.emit('file-progress', progress);

      this.receiveBuffer = [];
      this.currentReceiveMetadata = null;
      this.receivedSize = 0;
    }
  }

  async sendFiles(files: File[]) {
    for (const file of files) {
      const metadata: FileMetadata = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        lastModified: file.lastModified,
      };
      this.sendQueue.push({ file, metadata });
    }

    if (!this.isSending) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.sendQueue.length === 0) {
      this.isSending = false;
      return;
    }

    this.isSending = true;
    const { file, metadata } = this.sendQueue.shift()!;

    // Send metadata
    this.sendControlMessage('file-meta', metadata);

    // Send file in chunks
    const buffer = await file.arrayBuffer();
    let offset = 0;
    let sentBytes = 0;
    const startTime = Date.now();
    let lastSpeedTime = startTime;
    let lastSpeedSent = 0;

    while (offset < buffer.byteLength) {
      // Wait if channel buffer is full
      if (this.dataChannel && this.dataChannel.bufferedAmount > 16 * 1024 * 1024) {
        await new Promise<void>(resolve => {
          if (this.dataChannel) {
            this.dataChannel.onbufferedamountlow = () => resolve();
            this.dataChannel.bufferedAmountLowThreshold = 1024 * 1024;
          }
        });
      }

      const end = Math.min(offset + CHUNK_SIZE, buffer.byteLength);
      const chunk = buffer.slice(offset, end);

      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        this.dataChannel.send(chunk);
      }

      sentBytes += chunk.byteLength;
      offset = end;

      const now = Date.now();
      const elapsed = (now - lastSpeedTime) / 1000;
      let speed = 0;

      if (elapsed > 0.3) {
        speed = (sentBytes - lastSpeedSent) / elapsed;
        lastSpeedTime = now;
        lastSpeedSent = sentBytes;
      }

      const remaining = metadata.size - sentBytes;
      const eta = speed > 0 ? remaining / speed : 0;

      const progress: TransferProgress = {
        fileId: metadata.id,
        fileName: metadata.name,
        fileSize: metadata.size,
        transferred: sentBytes,
        percentage: Math.min(100, (sentBytes / metadata.size) * 100),
        speed,
        eta,
        status: 'transferring',
      };

      this.emit('send-progress', progress);

      // Small delay for UI updates
      if (offset % (CHUNK_SIZE * 4) === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }

    // Send end marker
    this.sendControlMessage('file-end', { id: metadata.id });

    const finalProgress: TransferProgress = {
      fileId: metadata.id,
      fileName: metadata.name,
      fileSize: metadata.size,
      transferred: metadata.size,
      percentage: 100,
      speed: 0,
      eta: 0,
      status: 'completed',
    };

    this.emit('send-progress', finalProgress);

    // Process next file
    await this.processQueue();
  }

  sendText(text: string) {
    this.sendControlMessage('text', text);
  }

  private sendControlMessage(type: string, data: any) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify({ type, data }));
    }
  }

  getConnectionState(): string {
    return this.peerConnection?.connectionState || 'new';
  }

  disconnect() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.sendQueue = [];
    this.isSending = false;
    this.receiveBuffer = [];
    this.currentReceiveMetadata = null;
    this.emit('disconnected');
  }
}

// Utility: generate a short session code
export function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Utility: format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Utility: format speed
export function formatSpeed(bytesPerSecond: number): string {
  return formatFileSize(bytesPerSecond) + '/s';
}

// Utility: format ETA
export function formatETA(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) return '—';
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

// Utility: get device name
export function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) {
    const match = ua.match(/Android.*?;\s*(.*?)\s*Build/);
    return match ? match[1] : 'Android Device';
  }
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Linux/i.test(ua)) return 'Linux PC';
  return 'Unknown Device';
}

// Utility: get file icon name based on MIME type
export function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return '📦';
  if (type.includes('text')) return '📝';
  if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📊';
  if (type.includes('document') || type.includes('word')) return '📃';
  return '📁';
}
