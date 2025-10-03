import { io } from 'socket.io-client';

const WS_URL = 'http://localhost:3001';

export const socket = io(WS_URL, {
  reconnectionAttempts: 5, 
  timeout: 10000,
});

socket.on('connect', () => {
  console.log('[Frontend WS] Connected to WebSocket Server.');
  // Future implementation: socket.emit('joinRoom', 'default-project-room');
});

socket.on('disconnect', () => {
  console.log('[Frontend WS] Disconnected.');
});

socket.on('connect_error', (err) => {
  console.error('[Frontend WS] Connection Error:', err.message);
});