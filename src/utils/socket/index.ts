import { io, Socket } from 'socket.io-client';

// Define server-to-client events
interface ServerToClientEvents {
  webhook_processed: (data: {
    accountId: string;
    parent_id?: string;
    [key: string]: any;
  }) => void;
}

type TypedSocket = Socket<ServerToClientEvents>;

let socket: TypedSocket | null = null;

export const initSocket = (url: string): TypedSocket => {
  if (!socket) {
    socket = io(url, {
      // auth: {
      //   token,
      // },
      autoConnect: false,
      path: '/socket.io',
      // transports: ['polling'], // transports: ['websocket'],
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      withCredentials: true,
    });

    // Add connection event listeners
    socket.on('connect', () => {
      // console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', _ => {
      // console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', error => {
      console.error('Socket connection error:', error.message);
    });

    // socket.on('reconnect', attemptNumber => {
    //   console.log('Socket reconnected after', attemptNumber, 'attempts');
    // });

    // socket.on('reconnect_error', error => {
    //   console.error('Socket reconnection error:', error.message);
    // });

    // socket.on('reconnect_failed', () => {
    //   console.error('Socket failed to reconnect after maximum attempts');
    // });

    // Add a test listener to verify events are being received
    // socket.onAny((eventName, ...args) => {
    //   console.log('📨 Socket event received:', eventName, args);
    // });
  }
  return socket;
};

export const getSocket = (): TypedSocket | null => {
  return socket;
};

export const connectSocket = (): void => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

// Properly typed event subscription
export const subscribeToEvent = <K extends keyof ServerToClientEvents>(
  event: K,
  callback: ServerToClientEvents[K]
): void => {
  if (socket) {
    socket.on(event, callback as any);
  }
};

// Properly typed event unsubscription
export const unsubscribeFromEvent = <K extends keyof ServerToClientEvents>(
  event: K,
  callback?: ServerToClientEvents[K]
): void => {
  if (socket) {
    if (callback) {
      socket.off(event, callback as any);
    } else {
      socket.off(event);
    }
  }
};

// Helper function to check connection status
export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

// Helper function to get socket ID
export const getSocketId = (): string | undefined => {
  return socket?.id;
};

// Cleanup function to properly destroy socket instance
export const destroySocket = (): void => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

// Type-safe event listener with cleanup
export const useSocketEvent = <K extends keyof ServerToClientEvents>(
  event: K,
  callback: ServerToClientEvents[K]
): (() => void) => {
  subscribeToEvent(event, callback);

  // Return cleanup function
  return () => {
    unsubscribeFromEvent(event, callback);
  };
};

// Export types for use in other files
export type { ServerToClientEvents, TypedSocket };
