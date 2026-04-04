const prisma = require('../config/db');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

// ua: Перевірка ролі користувача у конкретному воркспейсі
const restrictTo = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    // ua: get ID воркспейсу з параметрів URL (:id або :workspaceId)
    const workspaceId = req.params.workspaceId || req.params.id; // підтримка обох варіантів
    const userId = req.user.id; // ID

    if (!workspaceId) {
      return next(
        new AppError('Workspace ID is required for this action', 400),
      );
    }

    // search for the user's membership in the workspace
    const membership = await prisma.userWorkspace.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    // як запису немає — користувач не є учасником
    if (!membership) {
      return next(new AppError('You are not a member of this workspace', 403));
    }

    // чек чи входить роль користувача у список дозволених
    if (!allowedRoles.includes(membership.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    // + роль у req, щоб контролери могли її бачити при потребі
    req.userRole = membership.role;
    next();
  });
};

module.exports = { restrictTo };
