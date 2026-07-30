import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { socketAuthMiddleware } from './auth.middleware';
import { registerOrderHandlers, setIoInstance } from './order.namespace';
import { registerRiderHandlers } from './rider.namespace';
import { activeUserSockets } from './active-users';
import { Role } from '@prisma/client';

export function initializeSockets(server: HttpServer): Server {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Set instance for room broadcast helpers
  setIoInstance(io);

  // Apply JWT authentication handshake middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    if (user?.userId) {
      activeUserSockets[user.userId] = socket;
    }
    console.log(`[Socket Connection] ID: ${socket.id}, User: ${user?.userId}, Role: ${user?.role}`);

    // Register handlers based on user roles
    if (user?.role === Role.DELIVERY_PARTNER) {
      registerRiderHandlers(io, socket);
    }
    
    // Register order room channels for tracking (both customer and rider can join order status updates)
    registerOrderHandlers(io, socket);

    socket.on('disconnect', () => {
      if (user?.userId) {
        delete activeUserSockets[user.userId];
      }
      console.log(`[Socket Disconnected] ID: ${socket.id}`);
    });
  });

  console.log('[Socket.io]: Real-time socket server successfully mounted.');
  return io;
}
