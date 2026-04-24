// ua: Сервіс для глобального пошуку по документах та категоріях
const prisma = require('../config/db');

class SearchService {
  async globalSearch(userId, query) {
    // ua: отримання списку ID воркспейсів, до яких користувач має доступ
    const memberships = await prisma.userWorkspace.findMany({
      where: { userId },
      select: { workspaceId: true },
    });

    const workspaceIds = memberships.map((m) => m.workspaceId);

    // ua: якщо користувач не належить до жодного воркспейсу — порожній результат
    if (workspaceIds.length === 0) {
      return { documents: [], categories: [] };
    }

    // ua: паралельний пошук у категоріях та документах
    const [documents, categories] = await Promise.all([
      // Пошук в документах
      prisma.document.findMany({
        where: {
          category: { workspaceId: { in: workspaceIds } }, // ua: тільки в доступних воркспейсах
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          category: { select: { name: true } }, // ua: додання назви категорії для контексту
        },
      }),

      // Пошук в категоріях
      prisma.category.findMany({
        where: {
          workspaceId: { in: workspaceIds },
          name: { contains: query, mode: 'insensitive' },
        },
      }),
    ]);

    return { documents, categories };
  }
}

module.exports = new SearchService();
