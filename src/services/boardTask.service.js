// ua: сервіс для роботи з картками завдань (board tasks) у канбан-дошці

const prisma = require('../config/db');
const AppError = require('../utils/appError');

class BoardTaskService {
  // crud operations for board tasks

  //ua: створення нової картки завдання у колонці
  async createTask(userId, columnId, taskData) {
    const column = await prisma.taskCategory.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new AppError('Task column not found', 404);
    }

    // підрахунок карток у колонці для виставлення нової в самий кінець
    const count = await prisma.boardTask.count({
      where: { columnId },
    });

    const task = await prisma.boardTask.create({
      data: {
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority || 'MEDIUM',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        columnId,
        ownerId: userId,
        position: count,
      },
    });

    return task;
  }

  // ua: отримання всіх карток завдань у колонці
  async updateTask(id, taskData) {
    const task = await prisma.boardTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const updateData = { ...taskData };
    if (taskData.dueDate) updateData.dueDate = new Date(taskData.dueDate);

    return prisma.boardTask.update({
      where: { id },
      data: updateData,
    });
  }

  // ua: видалення картки завдання
  async deleteTask(id) {
    const task = await prisma.boardTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    await prisma.boardTask.delete({
      where: { id },
    });

    return task;
  }

  // reorder метод для зміни порядку карток завдань у колонці (дрег енд дроп)
  async reorderTasks(tasksArray) {
    return prisma.$transaction(
      tasksArray.map((task) =>
        prisma.boardTask.update({
          where: { id: task.id },
          data: {
            position: task.position,
            columnId: task.columnId,
          },
        }),
      ),
    );
  }

  // ua: привязка документа до картки завдання (linking a document to a board task)
  async linkDocument(taskId, documentId) {
    const task = await prisma.boardTask.findUnique({ where: { id: taskId } });
    const doc = await prisma.document.findUnique({ where: { id: documentId } });

    if (!task || !doc) {
      throw new AppError('Task or Document not found', 404);
    }

    return prisma.boardTask.update({
      where: { id: taskId },
      data: {
        documents: {
          connect: { id: documentId },
        },
      },
      include: { documents: true },
    });
  }

  // ua: відв'язка документа від картки завдання (unlinking dock)
  async unlinkDocument(taskId, documentId) {
    const task = await prisma.boardTask.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return prisma.boardTask.update({
      where: { id: taskId },
      data: {
        documents: {
          disconnect: { id: documentId },
        },
      },
      include: { documents: true },
    });
  }
}

module.exports = new BoardTaskService();
