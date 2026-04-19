const prisma = require('../config/db');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

// ua: Перевірка ролі користувача у конкретному воркспейсі - універсальний middleware для всіх ресів (категорії, документи, файли ітд)
const restrictTo = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    // ua: безпечне отримання workspaceId (перевіряємо чи існують body/params)
    let workspaceId =
      (req.params && req.params.workspaceId) ||
      (req.body && req.body.workspaceId);

    // ua: ПРІОРИТЕТ 0 - Якщо створюємо документ (є categoryId в body, але немає прямого workspaceId)
    if (!workspaceId && req.body && req.body.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: req.body.categoryId },
        select: { workspaceId: true },
      });
      if (category) workspaceId = category.workspaceId;
    }

    // ua: якщо workspaceId не знайдено, спроба витягнути його з контексту через URL params
    if (!workspaceId && req.params && req.params.id) {
      const id = req.params.id;
      const url = req.originalUrl;

      // ua: Контекст - воркспейс
      if (url.includes('/workspaces')) {
        workspaceId = id;
      }

      // ua: Контекст - категорії
      else if (url.includes('/categories')) {
        const category = await prisma.category.findUnique({
          where: { id },
          select: { workspaceId: true },
        });
        if (category) workspaceId = category.workspaceId;
      }

      // ua: Контекст - завантаження файлу (через ID документа в URL)
      else if (url.includes('/files/document/')) {
        const document = await prisma.document.findUnique({
          where: { id },
          include: { category: { select: { workspaceId: true } } },
        });
        if (document && document.category) {
          workspaceId = document.category.workspaceId;
        }
      }

      // ua: Контекст - видалення файлу (через ID самого файлу)
      else if (url.includes('/files/')) {
        const file = await prisma.file.findUnique({
          where: { id },
          include: {
            document: {
              include: { category: { select: { workspaceId: true } } },
            },
          },
        });
        if (file && file.document && file.document.category) {
          workspaceId = file.document.category.workspaceId;
        }
      }

      // ua: Контекст - док
      else if (url.includes('/documents')) {
        const document = await prisma.document.findUnique({
          where: { id },
          include: { category: { select: { workspaceId: true } } },
        });
        if (document && document.category) {
          workspaceId = document.category.workspaceId;
        }
      }
    }

    // ua: чек, чи взагалі ми знайшли до якого воркспейсу належить ресурс
    if (!workspaceId) {
      return next(
        new AppError(
          'Workspace context not found or resource does not exist',
          404,
        ),
      );
    }

    // ua: пошук чи юзер є учасником у цьому воркспейсі
    const membership = await prisma.userWorkspace.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!membership) {
      return next(new AppError('You are not a member of this workspace', 403));
    }

    // ua: перевірка ролі
    if (!allowedRoles.includes(membership.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    req.userRole = membership.role;
    next();
  });
};

module.exports = { restrictTo };
