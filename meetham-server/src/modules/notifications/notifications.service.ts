import { prisma } from '../../config/db';
import { sendRealTimeNotification } from '../../sockets/active-users';

export async function createNotification(
  userId: string,
  title: string,
  body: string,
  type: string = 'ORDER_UPDATE'
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      body,
      type,
    },
  });

  // Push in real-time if active socket connection exists
  sendRealTimeNotification(userId, 'notification:new', {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });

  return notification;
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: [
      { isRead: 'asc' }, // unread first
      { createdAt: 'desc' }, // newest first
    ],
  });
}

export async function markAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
