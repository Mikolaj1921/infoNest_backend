const whiteboardService = require('../services/whiteboard.service');
const asyncHandler = require('../utils/asyncHandler');

// crud
exports.getOrCreateWhiteboard = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { columnId } = req.query; // фільтр за категорією задач

  const whiteboard = await whiteboardService.getOrCreateWhiteboard(
    workspaceId,
    columnId,
  );

  res.status(200).json({
    success: true,
    data: {
      whiteboard,
      role: req.userRole,
    },
  });
});

exports.updateWhiteboard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workspaceId = req.query.workspaceId;

  const whiteboard = await whiteboardService.updateWhiteboard(
    id,
    workspaceId,
    req.body,
  );

  res.status(200).json({
    success: true,
    data: { whiteboard },
  });
});

// ua: оновлення налаштувань дошки
exports.updateWhiteboardSettings = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { settings } = req.body;
  const workspaceId = req.query.workspaceId;

  const whiteboard = await whiteboardService.updateWhiteboardSettings(
    id,
    workspaceId,
    settings,
  );

  res.status(200).json({
    success: true,
    data: { whiteboard },
  });
});
