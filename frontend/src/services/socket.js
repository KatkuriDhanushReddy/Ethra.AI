import { io } from 'socket.io-client';
import { getSocketUrl } from '../config/env.js';

const SOCKET_URL = getSocketUrl();

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: { token: localStorage.getItem('token') },
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  s.auth = { token: localStorage.getItem('token') };
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};
