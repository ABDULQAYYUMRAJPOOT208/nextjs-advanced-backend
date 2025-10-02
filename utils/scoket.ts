// utils/socket.ts
import { io } from 'socket.io-client';

// Define the URL for our dedicated WebSocket server (running on port 3001)
const WS_URL = 'http://localhost:3001';

// Create the client instance. This connection persists as long as the app runs.
export const socket = io(WS_URL, {
  reconnectionAttempts: 5, // Attempt to reconnect 5 times if connection is lost
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