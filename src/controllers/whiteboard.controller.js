// controller whiteboard

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
    data: { whiteboard },
  });
});

exports.updateWhiteboard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { elements } = req.body;

  const whiteboard = await whiteboardService.updateWhiteboard(id, elements);

  res.status(200).json({
    success: true,
    data: { whiteboard },
  });
});
