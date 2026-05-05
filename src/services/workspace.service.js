// ua: Сервіс для роботи з воркспейсами: створення, отримання, оновлення та видалення.

// Використовує транзакції для забезпечення цілісності даних при створенні воркспейсу
// та призначенні ролі власника.

const prisma = require('../config/db');
const AppError = require('../utils/appError');
const { getPagination } = require('../utils/pagination'); // ua: пагінація

class WorkspaceService {
  // ua: Створення воркспейсу + призначення ownera
  async createWorkspace(userId, workspaceData) {
    const { name, visibility } = workspaceData;

    // use transaction щоб обидва записи створилися або жоден
    return await prisma.$transaction(async (tx) => {
      // create workspace
      const workspace = await tx.workspace.create({
        data: {
          name,
          visibility,
          ownerId: userId,
        },
      });

      // add user to workspace with role owner
      await tx.userWorkspace.create({
        data: {
          userId: userId,
          workspaceId: workspace.id,
          role: 'Owner',
        },
      });

      return workspace;
    });
  }

  // ua: get all workspaces for user
  async getAllWorkspaces(userId, query) {
    const { skip, take, page, limit } = getPagination(query); // ua: параметри пагінації

    // ua: умова для фільтрації воркспейсів, до яких юзер має доступ
    const where = {
      users: {
        some: { userId },
      },
    };

    // ua: паралельне отримання даних та загальної кількості
    const [workspaces, totalCount] = await Promise.all([
      prisma.workspace.findMany({
        where,
        skip,
        take,
        include: {
          _count: { select: { users: true, categories: true } },
        },
        orderBy: { createdAt: 'desc' }, // ua: додаємо сортування за замовчуванням
      }),
      prisma.workspace.count({ where }),
    ]);

    return {
      // ua: повертаємо воркспейси та мета-дані для пагінації
      workspaces,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  // ua: update workspace (only owner can update)
  async updateWorkspace(workspaceId, userId, updateData) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace || workspace.ownerId !== userId) {
      throw new AppError(
        'Workspace not found or you do not have permissions',
        403,
      );
    }

    return await prisma.workspace.update({
      where: { id: workspaceId },
      data: updateData,
    });
  }

  // ua: Видалення воркспейсу
  async deleteWorkspace(workspaceId, userId) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace || workspace.ownerId !== userId) {
      throw new AppError(
        'Workspace not found or you do not have permissions',
        403,
      );
    }

    // зв'язки видаляться самі - cascade на рівні db
    return await prisma.workspace.delete({ where: { id: workspaceId } });
  }
}

module.exports = new WorkspaceService();
