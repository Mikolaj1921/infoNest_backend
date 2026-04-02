// ua: контролер для воркспейсу(тзв диспетчер) - створення, отримання, оновлення, видалення

// ua: всі операції доступні тільки для авторизованих юзерів, і юзер може
// працювати тільки зі своїми воркспейсами (крім отримання списку - там всі свої воркспейси)
const workspaceService = require('../services/workspace.service');
const asyncHandler = require('../utils/asyncHandler');

// ua: Створення нового воркспейсу

exports.createWorkspace = asyncHandler(async (req, res) => {
  // userId з req.user
  const workspace = await workspaceService.createWorkspace(
    req.user.id,
    req.body,
  );

  res.status(201).json({
    success: true,
    data: { workspace },
  });
});

// ua: Отримання списку воркспейсів поточного юзера
exports.getAllWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.getAllWorkspaces(req.user.id);

  res.status(200).json({
    success: true,
    results: workspaces.length,
    data: { workspaces },
  });
});

// ua: Оновлення назви або видимості
exports.updateWorkspace = asyncHandler(async (req, res) => {
  const updatedWorkspace = await workspaceService.updateWorkspace(
    req.params.id,
    req.user.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    data: { workspace: updatedWorkspace },
  });
});

// ua: Видалення воркспейсу
exports.deleteWorkspace = asyncHandler(async (req, res) => {
  await workspaceService.deleteWorkspace(req.params.id, req.user.id);

  res.status(204).json({
    success: true,
    data: null,
  });
});
