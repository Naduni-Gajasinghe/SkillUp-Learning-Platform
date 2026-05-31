import prisma from '../config/prisma';
import { getIO } from '../config/socket';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
  }) {
    const notification = await prisma.notification.create({
      data,
    });

    // Send real-time notification via Socket.IO
    const io = getIO();
    io.to(data.userId).emit('notification', notification);

    return notification;
  }

  async getMyNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
