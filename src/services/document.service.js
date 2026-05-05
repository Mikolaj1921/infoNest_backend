// ua: Сервіс для документів - створення, отримання, оновлення, видалення

const prisma = require('../config/db');
const AppError = require('../utils/appError');
const activityService = require('./activity.service'); // ua: сервіс активності
const { getPagination } = require('../utils/pagination'); // ua: утиліту пагінації

class DocumentService {
  // ua: Отримання списку документів з пагінацією та фільтрацією
  async getAllDocuments(workspaceId, query) {
    const { skip, take, page, limit } = getPagination(query);

    // ua: фільтр за воркспейсом, категорією та видимістю
    const where = {
      category: { workspaceId }, // ua: умова приналежності до воркспейсу
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.visibility && { visibility: query.visibility }),
    };

    // ua: Паралельно отримується дані та загальну кількість для мета-даних
    const [documents, totalCount] = await Promise.all([
      prisma.document.findMany({
        where,
        skip, // ua: пропускаємо певну кількість записів для пагінації
        take, // ua: обмежуємо кількість записів для пагінації
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          owner: { select: { name: true } },
        },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      // ua: повертаємо документи та мета-дані для пагінації
      documents,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  // ua: Створення документа
  async createDocument(userId, categoryId, data) {
    // ua: перевірка, чи існує категорія (тепер підтягуємо workspaceId для логу активності)
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, workspaceId: true },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const newDocument = await prisma.document.create({
      data: {
        title: data.title,
        content: data.content,
        categoryId: categoryId,
        ownerId: userId,
      },
    });

    // ua: запис активності
    activityService.logActivity(
      category.workspaceId,
      userId,
      'CREATE_DOCUMENT',
      newDocument.id,
      newDocument.title,
    );

    return newDocument;
  }

  // ua: Отримання документа за id
  async getDocumentById(id) {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, workspaceId: true },
        },
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }
    return document;
  }

  // ua: Оновлення документа
  async updateDocument(id, userId, data) {
    // ua: перевірка існування (підтягуємо категорію для логу)
    const oldDocument = await prisma.document.findUnique({
      where: { id },
      include: { category: { select: { workspaceId: true } } },
    });

    if (!oldDocument) {
      throw new AppError('Document not found', 404);
    }

    const updatedDocument = await prisma.$transaction(async (tx) => {
      await tx.revision.create({
        data: {
          documentId: id,
          content: oldDocument.content,
          editorId: userId,
        },
      });

      return await tx.document.update({
        where: { id },
        data: data,
      });
    });

    // ua: запис активності
    activityService.logActivity(
      oldDocument.category.workspaceId,
      userId,
      'UPDATE_DOCUMENT',
      updatedDocument.id,
      updatedDocument.title,
    );

    return updatedDocument;
  }

  // ua: Отримання історії змін документа (ревізій)
  async getDocumentRevisions(documentId) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    return await prisma.revision.findMany({
      where: { documentId },
      include: {
        editor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ua: Видалення документа
  async deleteDocument(id) {
    // ua: перевірка (підтягуємо категорію для логу)
    const document = await prisma.document.findUnique({
      where: { id },
      include: { category: { select: { workspaceId: true } } },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    await prisma.document.delete({
      where: { id },
    });

    // ua: запис активності
    activityService.logActivity(
      document.category.workspaceId,
      document.ownerId,
      'DELETE_DOCUMENT',
      document.id,
      document.title,
    );

    return document;
  }
}

module.exports = new DocumentService();
