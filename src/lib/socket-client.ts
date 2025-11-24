import { io, Socket } from 'socket.io-client';
import type { MediaItem } from '@/types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export class MemorySocketClient {
  private socket: Socket | null = null;
  private memoryId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(memoryId: string) {
    if (this.socket && this.memoryId === memoryId) {
      return; // Already connected to this memory
    }

    this.disconnect();
    this.memoryId = memoryId;

    this.socket = io(`${WS_URL}/memory`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      if (this.socket && this.memoryId) {
        this.socket.emit('join', this.memoryId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      if (this.memoryId) {
        this.socket.emit('leave', this.memoryId);
      }
      this.socket.disconnect();
      this.socket = null;
    }
    this.memoryId = null;
    this.reconnectAttempts = 0;
  }

  onNewMedia(callback: (mediaItem: MediaItem) => void) {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.on('newMedia', callback);
  }

  offNewMedia(callback?: (mediaItem: MediaItem) => void) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off('newMedia', callback);
    } else {
      this.socket.off('newMedia');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const memorySocketClient = new MemorySocketClient();
