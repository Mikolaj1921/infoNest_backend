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

  // ua: Оновлення документа
  async updateDocument(id, data) {
    // ua: перевірка, чи існує документ
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // ua: оновлення документа
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: data,
    });

    return updatedDocument;
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
