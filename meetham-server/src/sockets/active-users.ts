import { Socket } from 'socket.io';

// Map of userId -> Socket instance
export const activeUserSockets: Record<string, Socket> = {};

export function sendRealTimeNotification(userId: string, eventName: string, payload: any) {
  const socket = activeUserSockets[userId];
  if (socket) {
    socket.emit(eventName, payload);
    return true;
  }
  return false;
}
