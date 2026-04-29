// ua: сервіс для керування внутрішніми сповіщеннями користувачів

const prisma = require('../config/db');

class NotificationService {
  // ua: створення нового сповіщення
  async createNotification(userId, { title, message, type }) {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  }

  // ua: отримання всіх сповіщень користувача
  async getUserNotifications(userId) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ua: позначення сповіщення як прочитаного
  async markAsRead(notificationId, userId) {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId, // ua: тільки власник може позначити як прочитане
      },
      data: { isRead: true },
    });
  }
}

module.exports = new NotificationService();
