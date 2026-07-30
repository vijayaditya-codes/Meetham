import { Socket, Server } from 'socket.io';
import { prisma } from '../config/db';
import { broadcastRiderLocation } from './order.namespace';

const lastWriteTime: Record<string, number> = {};
const activeRiderSockets: Record<string, Socket> = {}; // track rider userId -> socket

export function registerRiderHandlers(io: Server, socket: Socket) {
  const userId = socket.data.user?.userId;
  if (!userId) return;

  activeRiderSockets[userId] = socket;
  console.log(`[Socket] Rider connected: User ${userId}`);

  socket.on('location:update', async (data: {
    assignmentId?: string;
    orderId: string;
    lat: number;
    lng: number;
  }) => {
    try {
      const { orderId, lat, lng, assignmentId } = data;
      
      // 1. Broadcast to the order room immediately (real-time tracking)
      broadcastRiderLocation(orderId, lat, lng);

      // 2. Throttle DB updates (every 15 seconds)
      const now = Date.now();
      const lastWrite = lastWriteTime[userId] || 0;

      if (now - lastWrite > 15000) {
        lastWriteTime[userId] = now;

        // Fetch partner profile
        const partner = await prisma.deliveryPartner.findUnique({
          where: { userId },
        });

        if (partner) {
          // Update partner coords
          await prisma.deliveryPartner.update({
            where: { id: partner.id },
            data: {
              currentLat: lat,
              currentLng: lng,
              lastPingAt: new Date(),
            },
          });

          // Update assignment coords
          if (assignmentId) {
            await prisma.deliveryAssignment.update({
              where: { id: assignmentId },
              data: {
                currentLat: lat,
                currentLng: lng,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('[Socket Location Update Error]:', error);
    }
  });

  socket.on('disconnect', () => {
    delete activeRiderSockets[userId];
    console.log(`[Socket] Rider disconnected: User ${userId}`);
  });
}

/**
 * Send an assignment offer to a specific rider via their active socket connection
 */
export function sendRiderAssignmentOffer(riderUserId: string, assignment: any) {
  const socket = activeRiderSockets[riderUserId];
  if (socket) {
    socket.emit('assignment:new', assignment);
    console.log(`[Socket] Sent order assignment invite to rider ${riderUserId}`);
    return true;
  }
  console.log(`[Socket] Rider ${riderUserId} is offline or not socket-connected`);
  return false;
}
