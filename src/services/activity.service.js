// ua: сервіс для роботи з активностями (логами) користувачів

const prisma = require('../config/db');

class ActivityService {
  // ua: створення запису про подію

  async logActivity({
    userId,
    workspaceId,
    action,
    entityId = null,
    entityName = null,
  }) {
    try {
      return await prisma.activity.create({
        data: {
          workspaceId,
          userId,
          action,
          entityId,
          entityName,
        },
      });
    } catch (error) {
      // ua: не переривається робота програми, якщо лог не записався, але вивід помилки в консоль
      console.error(`[Activity Log Error]: ${error.message}`);
    }
  }
  // ua: отримання стрічки активності для воркспейсу
  async getWorkspaceActivity(workspaceId) {
    return await prisma.activity.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // ua: обмеження останніми 50 подіями
    });
  }
}

module.exports = new ActivityService();
