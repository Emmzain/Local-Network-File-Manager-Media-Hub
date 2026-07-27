/**
 * EZShare Signaling Server
 * Handles WebRTC signaling via Socket.IO.
 * 
 * Run: bun run server/index.ts
 * Or: bun --watch server/index.ts (development with hot reload)
 */

import { Server } from 'socket.io';
import { createServer } from 'http';

const PORT = parseInt(process.env.SIGNALING_PORT || '3001');

const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', rooms: rooms.size }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

interface RoomInfo {
  id: string;
  creator: string;
  creatorName: string;
  peer: string | null;
  peerName: string | null;
  createdAt: number;
}

const rooms = new Map<string, RoomInfo>();

// Cleanup old rooms every 30 minutes
setInterval(() => {
  const now = Date.now();
  const THIRTY_MINUTES = 30 * 60 * 1000;
  for (const [id, room] of rooms) {
    if (now - room.createdAt > THIRTY_MINUTES) {
      rooms.delete(id);
      console.log(`[Cleanup] Room ${id} expired`);
    }
  }
}, 5 * 60 * 1000);

io.on('connection', (socket) => {
  console.log(`[Connect] ${socket.id}`);

  // Create a new room
  socket.on('create-room', (data: { roomId: string; deviceName: string }) => {
    const { roomId, deviceName } = data;

    if (rooms.has(roomId)) {
      socket.emit('room-error', { message: 'Room already exists. Try again.' });
      return;
    }

    const room: RoomInfo = {
      id: roomId,
      creator: socket.id,
      creatorName: deviceName,
      peer: null,
      peerName: null,
      createdAt: Date.now(),
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit('room-created', { roomId });
    console.log(`[Room] ${roomId} created by ${deviceName} (${socket.id})`);
  });

  // Join an existing room
  socket.on('join-room', (data: { roomId: string; deviceName: string }) => {
    const { roomId, deviceName } = data;
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('room-error', { message: 'Session not found. Check the code and try again.' });
      return;
    }

    if (room.peer) {
      socket.emit('room-error', { message: 'Session is full. Only two devices can connect.' });
      return;
    }

    room.peer = socket.id;
    room.peerName = deviceName;
    socket.join(roomId);

    // Notify joiner
    socket.emit('room-joined', {
      roomId,
      peerDeviceName: room.creatorName,
    });

    // Notify creator that someone joined
    io.to(room.creator).emit('peer-joined', {
      peerId: socket.id,
      deviceName,
    });

    console.log(`[Room] ${roomId}: ${deviceName} (${socket.id}) joined`);
  });

  // WebRTC signaling relay
  socket.on('offer', (data: { offer: any; roomId: string }) => {
    const room = rooms.get(data.roomId);
    if (room) {
      const target = room.creator === socket.id ? room.peer : room.creator;
      if (target) {
        io.to(target).emit('offer', { offer: data.offer });
      }
    }
  });

  socket.on('answer', (data: { answer: any; roomId: string }) => {
    const room = rooms.get(data.roomId);
    if (room) {
      const target = room.creator === socket.id ? room.peer : room.creator;
      if (target) {
        io.to(target).emit('answer', { answer: data.answer });
      }
    }
  });

  socket.on('ice-candidate', (data: { candidate: any; roomId: string }) => {
    const room = rooms.get(data.roomId);
    if (room) {
      const target = room.creator === socket.id ? room.peer : room.creator;
      if (target) {
        io.to(target).emit('ice-candidate', { candidate: data.candidate });
      }
    }
  });

  // Leave room
  socket.on('leave-room', (data: { roomId: string }) => {
    handleLeaveRoom(socket, data.roomId);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[Disconnect] ${socket.id}`);

    // Find and clean up any rooms this socket was in
    for (const [roomId, room] of rooms) {
      if (room.creator === socket.id || room.peer === socket.id) {
        handleLeaveRoom(socket, roomId);
      }
    }
  });
});

function handleLeaveRoom(socket: any, roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.creator === socket.id) {
    // Creator left — notify peer and delete room
    if (room.peer) {
      io.to(room.peer).emit('peer-left', { deviceName: room.creatorName });
    }
    rooms.delete(roomId);
    console.log(`[Room] ${roomId} deleted (creator left)`);
  } else if (room.peer === socket.id) {
    // Peer left — notify creator
    io.to(room.creator).emit('peer-left', { deviceName: room.peerName });
    room.peer = null;
    room.peerName = null;
    console.log(`[Room] ${roomId}: peer left`);
  }

  socket.leave(roomId);
}

httpServer.listen(PORT, () => {
  console.log(`\n🚀 EZShare Signaling Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});
