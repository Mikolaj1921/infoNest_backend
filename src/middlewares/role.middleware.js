const prisma = require('../config/db');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

// ua: Перевірка ролі користувача у конкретному воркспейсі - універсальний middleware для всіх ресів (категорії, документи, файли ітд)
const restrictTo = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    let workspaceId = req.params.workspaceId || req.body.workspaceId;

    // ua: якщо workspaceId не знайдено, спроба витягнути його з контексту
    if (!workspaceId && req.params.id) {
      const id = req.params.id;
      const url = req.originalUrl;

      // ua: Контекст - категорії (пошук воркспейсу через категорію)
      if (url.includes('/categories')) {
        const category = await prisma.category.findUnique({
          where: { id },
          select: { workspaceId: true },
        });
        if (category) workspaceId = category.workspaceId;
      }

      // ua: Контекст - док або файли (пошук через ієрархію)
      else if (url.includes('/documents') || url.includes('/files')) {
        const document = await prisma.document.findUnique({
          where: { id },
          include: { category: { select: { workspaceId: true } } },
        });
        if (document) workspaceId = document.category.workspaceId;
      }

      // ua: Контекст - воркспейс (прямий ід воркспейсу)
      else if (url.includes('/workspaces')) {
        workspaceId = id;
      }
    }

    // ua: чек, чи взагалі ми знайшли до якого воркспейсу належить ресурс
    if (!workspaceId) {
      return next(new AppError('Workspace context not found', 400));
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
