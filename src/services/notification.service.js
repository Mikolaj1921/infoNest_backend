// ua: сервіс для керування внутрішніми сповіщеннями користувачів

const prisma = require('../config/db');
const { getPagination } = require('../utils/pagination'); // ua: пагінація

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
  async getUserNotifications(userId, query) {
    const { skip, take, page, limit } = getPagination(query); // ua: параметри пагінації

    // ua: паралельне отримання даних та загальної кількості сповіщень
    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
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
