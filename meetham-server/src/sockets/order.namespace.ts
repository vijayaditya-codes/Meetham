import { Socket, Server } from 'socket.io';

let ioInstance: Server | null = null;

export function setIoInstance(io: Server) {
  ioInstance = io;
}

export function registerOrderHandlers(io: Server, socket: Socket) {
  // Join a specific order tracking room
  socket.on('order:join', (orderId: string) => {
    socket.join(`order:${orderId}`);
    console.log(`[Socket] User ${socket.data.user?.userId} joined room order:${orderId}`);
  });

  // Leave a specific order tracking room
  socket.on('order:leave', (orderId: string) => {
    socket.leave(`order:${orderId}`);
    console.log(`[Socket] User ${socket.data.user?.userId} left room order:${orderId}`);
  });
}

/**
 * Utility to broadcast order status updates to all listeners in the order room
 */
export function broadcastOrderStatus(orderId: string, status: string) {
  if (ioInstance) {
    ioInstance.to(`order:${orderId}`).emit(`order:${orderId}:status`, { status });
    console.log(`[Socket] Broadcasted status update for order ${orderId} -> ${status}`);
  }
}

/**
 * Utility to broadcast rider location changes to all listeners in the order room
 */
export function broadcastRiderLocation(orderId: string, lat: number, lng: number) {
  if (ioInstance) {
    ioInstance.to(`order:${orderId}`).emit(`order:${orderId}:location`, { lat, lng });
  }
}
