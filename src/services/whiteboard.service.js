const prisma = require('../config/db');
const AppError = require('../utils/appError');

class WhiteboardService {
  // ua: отримання або створення дошки для всього воркспейсу або конкретної колонки
  async getOrCreateWhiteboard(workspaceId, columnId = null) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    // ua: пошук існуючої дошки для воркспейсу або колонки
    let whiteboard = await prisma.whiteboard.findFirst({
      where: {
        workspaceId,
        columnId: columnId || null,
      },
    });

    // ua: якщо дошка не існує
    if (!whiteboard) {
      whiteboard = await prisma.whiteboard.create({
        data: {
          workspaceId,
          columnId: columnId || null,
          elements: [], // default empty
        },
      });
    }

    return whiteboard;
  }

  // ua: оновлення елементів дошки + санітизація текстових блоків
  async updateWhiteboard(id, elements) {
    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id },
    });

    if (!whiteboard) {
      throw new AppError('Whiteboard session not found', 404);
    }

    // ua: очищення текстових блоків фігур від можливих script інєкцій
    const sanitizedElements = elements.map((el) => {
      if (el && typeof el === 'object' && typeof el.text === 'string') {
        return {
          ...el,
          text: el.text.replace(/</g, '&lt;').replace(/>/g, '&gt;'), // Просте екранування символів тегів
        };
      }
      return el;
    });

    // ua: оновлення дошки з санітизованими елементами
    return prisma.whiteboard.update({
      where: { id },
      data: {
        elements: sanitizedElements,
      },
    });
  }
}

module.exports = new WhiteboardService();
