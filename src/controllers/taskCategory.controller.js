// ua: контролер для категорій завдань

const taskCategoryService = require('../services/taskCategory.service');
const asyncHandler = require('../utils/asyncHandler');

//crud operations for task categories
exports.createCategory = asyncHandler(async (req, res) => {
  const { workspaceId, name } = req.body;
  const category = await taskCategoryService.createTaskCategory(
    workspaceId,
    name,
  );

  res.status(201).json({
    success: true,
    data: { category },
  });
});

exports.getWorkspaceCategories = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const categories =
    await taskCategoryService.getWorkspaceTaskCategories(workspaceId);

  res.status(200).json({
    success: true,
    data: { categories },
  });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await taskCategoryService.updateTaskCategory(id, name);

  res.status(200).json({
    success: true,
    data: { category },
  });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await taskCategoryService.deleteTaskCategory(id);

  res.status(204).send();
});
