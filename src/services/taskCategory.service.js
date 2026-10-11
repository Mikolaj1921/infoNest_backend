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

    // підрахунок: кількість колонок, щоб виставити нову в кінець списку
    const count = await prisma.taskCategory.count({
      where: { workspaceId },
    });

    const newCategory = await prisma.taskCategory.create({
      data: {
        name,
        workspaceId,
        position: count,
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
      orderBy: { position: 'asc' },
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
  // ua: видалення категорії завдань (колонки)
  async deleteTaskCategory(id) {
    const category = await prisma.taskCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError('Task column not found', 404);
    }

    await prisma.taskCategory.delete({
      where: { id },
    });

    return category;
  }
}

module.exports = new TaskCategoryService();
