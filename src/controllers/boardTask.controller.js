// boardTask controller

const boardTaskService = require('../services/boardTask.service');
const asyncHandler = require('../utils/asyncHandler');

//crud operations for board tasks

exports.createTask = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { columnId } = req.body;
  const task = await boardTaskService.createTask(userId, columnId, req.body);

  res.status(201).json({
    success: true,
    data: { task },
  });
});

exports.updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await boardTaskService.updateTask(id, req.body);

  res.status(200).json({
    success: true,
    data: { task },
  });
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await boardTaskService.deleteTask(id);

  res.status(204).send();
});

exports.reorderTasks = asyncHandler(async (req, res) => {
  const { tasks } = req.body;
  await boardTaskService.reorderTasks(tasks);

  res.status(200).json({
    success: true,
    message: 'Tasks reordered successfully',
  });
});

exports.linkDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { documentId } = req.body;
  const task = await boardTaskService.linkDocument(id, documentId);

  res.status(200).json({
    success: true,
    data: { task },
  });
});

exports.unlinkDocument = asyncHandler(async (req, res) => {
  const { id, docId } = req.params;
  const task = await boardTaskService.unlinkDocument(id, docId);

  res.status(200).json({
    success: true,
    data: { task },
  });
});
