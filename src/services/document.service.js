// ua: Сервіс для документів - створення, отримання, оновлення, видалення

const prisma = require('../config/db');
const AppError = require('../utils/appError');

class DocumentService {
  // ua: Створення документа
  async createDocument(userId, categoryId, data) {
    // ua: перевірка, чи існує категорія
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      //include: { workspace: true }, // ua: щоб перевірити, чи належить категорія юзеру
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // ua: створення документа

    const newDocument = await prisma.document.create({
      data: {
        title: data.title,
        content: data.content,
        categoryId: categoryId,
        ownerId: userId,
      },
    });

    return newDocument;
  }

  // ua: Отримання документа за id
  async getDocumentById(id) {
    // ua: отримання документа з підтягуванням даних про власника та категорію
    //  (щоб не робити додаткові запити при відображенні документа)
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        // ua: підтягування даних про (owner)
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        // ua: підтягування даних про категорію
        category: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
          },
        },
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }
    return document;
  }

  // ua: Оновлення документа враз з збереженням ревізії(історії змін)
  async updateDocument(id, userId, data) {
    // ua: перевірка, чи існує документ
    const oldDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!oldDocument) {
      throw new AppError('Document not found', 404);
    }

    // ua: використання транзакції для створення ревізії та оновлення документа
    return await prisma.$transaction(async (prisma) => {
      // ua: створення запису в історії (збееження контенту який був до оновлення)
      await prisma.revision.create({
        data: {
          documentId: id,
          content: oldDocument.content,
          editorId: userId,
        },
      });

      // ua: оновлення документа новими даними
      return await prisma.document.update({
        where: { id },
        data: data,
      });
    });
  }

  // ua: Отримання історії змін документа (ревізій)
  async getDocumentRevisions(documentId) {
    // ua: перевірка, чи існує документ
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // ua: отримання ревізій документа з підтягуванням даних про редактора та сортуванням за датою
    const revisions = await prisma.revision.findMany({
      where: { documentId },
      include: {
        editor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      // ua: сортування ревізій за датою створення (найновіші перші)
      orderBy: {
        createdAt: 'desc',
      },
    });

    return revisions;
  }

  // ua: Видалення документа
  async deleteDocument(id) {
    // ua: перевірка, чи існує документ
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // ua: видалення документа
    await prisma.document.delete({
      where: { id },
    });

    return document;
  }
}

module.exports = new DocumentService();
