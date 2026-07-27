/**
 * Signaling Client
 * Manages Socket.IO connection for WebRTC signaling.
 * For development, uses a local signaling server.
 * For production, connect to your deployed signaling server.
 */

import { io, Socket } from 'socket.io-client';

export type SignalingEvent =
  | 'connected'
  | 'disconnected'
  | 'room-created'
  | 'room-joined'
  | 'peer-joined'
  | 'peer-left'
  | 'offer'
  | 'answer'
  | 'ice-candidate'
  | 'error'
  | 'device-info';

type EventHandler = (data?: any) => void;

export class SignalingClient {
  private socket: Socket | null = null;
  private handlers: Map<string, EventHandler[]> = new Map();
  private roomId: string | null = null;
  private deviceName: string = 'Unknown Device';

  constructor(private serverUrl: string = '') {
    // Default to current origin for development
    if (!serverUrl) {
      this.serverUrl = typeof window !== 'undefined' ? window.location.origin : '';
    }
  }

  on(event: SignalingEvent | string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
    return this;
  }

  off(event: string, handler?: EventHandler) {
    if (!handler) {
      this.handlers.delete(event);
    } else {
      const handlers = this.handlers.get(event);
      if (handlers) {
        this.handlers.set(event, handlers.filter(h => h !== handler));
      }
    }
  }

  private emit(event: string, data?: any) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(h => h(data));
  }

  connect(deviceName: string = 'Unknown Device') {
    this.deviceName = deviceName;

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.emit('connected', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', () => {
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (err) => {
      this.emit('error', { message: 'Connection failed: ' + err.message });
    });

    // Room events
    this.socket.on('room-created', (data) => {
      this.roomId = data.roomId;
      this.emit('room-created', data);
    });

    this.socket.on('room-joined', (data) => {
      this.roomId = data.roomId;
      this.emit('room-joined', data);
    });

    this.socket.on('peer-joined', (data) => {
      this.emit('peer-joined', data);
    });

    this.socket.on('peer-left', (data) => {
      this.emit('peer-left', data);
    });

    // WebRTC signaling relay
    this.socket.on('offer', (data) => {
      this.emit('offer', data);
    });

    this.socket.on('answer', (data) => {
      this.emit('answer', data);
    });

    this.socket.on('ice-candidate', (data) => {
      this.emit('ice-candidate', data);
    });

    this.socket.on('device-info', (data) => {
      this.emit('device-info', data);
    });

    this.socket.on('room-error', (data) => {
      this.emit('error', data);
    });
  }

  createRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('create-room', {
        roomId,
        deviceName: this.deviceName,
      });
    }
  }

  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join-room', {
        roomId,
        deviceName: this.deviceName,
      });
    }
  }

  sendOffer(offer: RTCSessionDescriptionInit) {
    if (this.socket) {
      this.socket.emit('offer', { offer, roomId: this.roomId });
    }
  }

  sendAnswer(answer: RTCSessionDescriptionInit) {
    if (this.socket) {
      this.socket.emit('answer', { answer, roomId: this.roomId });
    }
  }

  sendIceCandidate(candidate: RTCIceCandidateInit) {
    if (this.socket) {
      this.socket.emit('ice-candidate', { candidate, roomId: this.roomId });
    }
  }

  sendDeviceInfo(info: { name: string; type: string }) {
    if (this.socket) {
      this.socket.emit('device-info', { ...info, roomId: this.roomId });
    }
  }

  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit('leave-room', { roomId: this.roomId });
      this.roomId = null;
    }
  }

  disconnect() {
    this.leaveRoom();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.handlers.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getRoomId(): string | null {
    return this.roomId;
  }
}
