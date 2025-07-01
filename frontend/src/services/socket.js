import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    // If already connected, return existing socket
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected:', this.socket.id);
      return this.socket;
    }

    // Use your hosted backend URL
    const serverUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    const socketUrl = serverUrl.replace('/api', '');
    
    console.log('Connecting to Socket.IO server at:', socketUrl);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    
    this.socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false, // Don't force new connection if one exists
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: this.maxReconnectAttempts
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection failed:', error);
    });

    return this.socket;
  }

  // Listen to events
  on(event, callback) {
    if (!this.socket) this.connect();
    
    this.socket.on(event, callback);
    
    // Store listeners for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listeners
  off(event, callback) {
    if (!this.socket) return;
    
    this.socket.off(event, callback);
    
    // Remove from listeners map
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit events
  emit(event, data) {
    if (!this.socket) this.connect();
    this.socket.emit(event, data);
  }

  // Get connection status
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Manual reconnect
  reconnect() {
    console.log('Manually reconnecting socket...');
    if (this.socket) {
      this.socket.disconnect();
    }
    this.socket = null;
    this.reconnectAttempts = 0;
    return this.connect();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;
