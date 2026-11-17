// service for managing task categories (columns) in a Kanban board
// ua: робочий простір таблиці - колонки (категорії завдань)

const prisma = require('../config/db');
const AppError = require('../utils/appError');

class TaskCategoryService {
  // ua: створення нової категорії завдань (колонки)
  async createTaskCategory(workspaceId, name) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    // ua: визначення наступної позиції, щоб нова колонка була в кінці списку
    const lastCategory = await prisma.taskCategory.aggregate({
      where: { workspaceId },
      _max: { position: true },
    });

    const nextPosition = (lastCategory._max.position ?? -1) + 1;

    const newCategory = await prisma.taskCategory.create({
      data: {
        name,
        workspaceId,
        position: nextPosition,
      },
    });

    return newCategory;
  }

  // ua: отримання всіх категорій завдань (колонок)
  async getWorkspaceTaskCategories(workspaceId) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    // Повертаємо колонки, відсортовані за позицією
    return prisma.taskCategory.findMany({
      where: { workspaceId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      include: {
        boardTasks: {
          orderBy: { position: 'asc' },
          include: { documents: true },
        },
      },
    });
  }

  // ua: оновлення назви категорії завдань
  async updateTaskCategory(id, name) {
    const category = await prisma.taskCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError('Task column not found', 404);
    }

    return prisma.taskCategory.update({
      where: { id },
      data: { name },
    });
  }

  // ua: зміна порядку колонок Kanban-дошки
  async reorderTaskCategories(workspaceId, categoriesArray) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    return prisma.$transaction(async (tx) => {
      const existingCategories = await tx.taskCategory.findMany({
        where: { workspaceId },
        select: { id: true },
      });

      // ua: перевіряємо, що передано всі колонки саме цього робочого простору
      const existingIds = new Set(
        existingCategories.map((category) => category.id),
      );
      const receivedIds = categoriesArray.map((category) => category.id);

      if (
        existingIds.size !== receivedIds.length ||
        receivedIds.some((id) => !existingIds.has(id))
      ) {
        throw new AppError('Invalid task categories for this workspace', 400);
      }

      // ua: зберігаємо нові позиції колонок
      await Promise.all(
        categoriesArray.map((category) =>
          tx.taskCategory.update({
            where: { id: category.id },
            data: { position: category.position },
          }),
        ),
      );

      return tx.taskCategory.findMany({
        where: { workspaceId },
        orderBy: { position: 'asc' },
      });
    });
  }

  // ua: видалення категорії завдань (колонки)
  async deleteTaskCategory(id) {
    const category = await prisma.taskCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError('Task column not found', 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.taskCategory.delete({
        where: { id },
      });

      // ua: перенумеровуємо позиції колонок після видалення
      const remainingCategories = await tx.taskCategory.findMany({
        where: { workspaceId: category.workspaceId },
        orderBy: { position: 'asc' },
        select: { id: true },
      });

      await Promise.all(
        remainingCategories.map((item, index) =>
          tx.taskCategory.update({
            where: { id: item.id },
            data: { position: index },
          }),
        ),
      );
    });

    return category;
  }
}

module.exports = new TaskCategoryService();
