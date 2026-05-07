// ua: сервіс для роботи з активностями (логами) користувачів

const prisma = require('../config/db');
const { getPagination } = require('../utils/pagination');
// logger - для запису помилок
const logger = require('../utils/logger');

class ActivityService {
  // ua: створення запису про подію

  async logActivity(
    workspaceId,
    userId,
    action,
    entityId = null,
    entityName = null,
  ) {
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
      logger.error(`[Activity Log Error]: ${error.message}`, {
        workspaceId,
        userId,
        action,
      });
    }
  }
  // ua: отримання стрічки активності для воркспейсу
  async getWorkspaceActivity(workspaceId, query) {
    const { skip, take, page, limit } = getPagination(query);

    const [activity, totalCount] = await Promise.all([
      prisma.activity.findMany({
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
        skip, // ua: пропускаємо певну кількість записів для пагінації
        take, // ua: обмежуємо кількість записів, які повертаються для пагінації
      }),
      prisma.activity.count({ where: { workspaceId } }),
    ]);

    return {
      // ua: масив активностей та інформацію про пагінацію
      activity,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}

module.exports = new ActivityService();
