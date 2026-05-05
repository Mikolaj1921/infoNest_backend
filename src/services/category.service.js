// ua: Сервіс для роботи з категоріями: створення, отримання

const prisma = require('../config/db');
const AppError = require('../utils/appError');

const { getPagination } = require('../utils/pagination');

class CategoryService {
  // ua: Створення категорії
  async createCategory(workspaceId, name) {
    // перевірка, чи існує воркспейс

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    // ua: якщо воркспейс не знайдено, error повернути
    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    // ua: створення категорії

    const newCategory = await prisma.category.create({
      data: {
        name: name,
        workspaceId: workspaceId,
      },
    });

    return newCategory;
  }

  // ua: Отримання всіх категорій для воркспейсу
  async getWorkspaceCategories(workspaceId, query) {
    const { skip, take, page, limit } = getPagination(query);

    // ua: перевірка, чи існує воркспейс
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    // ua: якщо воркспейс не знайдено, error повернути
    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    // ua: отримання категорій для воркспейсу + кількість документів у кожній категорії
    // ua: додано пагінацію та повернення результату разом із мета-даними
    const [categories, totalCount] = await Promise.all([
      prisma.category.findMany({
        where: { workspaceId: workspaceId }, // ua: перевірка, чи існує воркспейс
        skip,
        take,
        include: {
          _count: { select: { documents: true } }, // ua:  кількість документів у категорії
        },
        orderBy: { name: 'asc' },
      }),
      prisma.category.count({ where: { workspaceId } }),
    ]);

    return {
      // ua: повертаємо категорії та мета-дані для пагінації
      categories,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  // ua: Оновлення категорії
  async updateCategory(id, name) {
    // ua: перевірка, чи існує категорія
    const category = await prisma.category.findUnique({
      where: { id },
    });

    // ua: якщо категорія не знайдена, error повернути
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // ua: оновлення категорії
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    });

    return updatedCategory;
  }

  // ua: Видалення категорії
  async deleteCategory(id) {
    // ua: перевірка, чи існує категорія
    const category = await prisma.category.findUnique({
      where: { id },
    });

    // ua: якщо категорія не знайдена, error повернути
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // ua: видалення категорії
    await prisma.category.delete({
      where: { id },
    });

    return category;
  }
}

module.exports = new CategoryService();
