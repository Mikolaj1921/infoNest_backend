// ua: контролер для категорій - створення, отримання, оновлення, видалення

const categoryService = require('../services/category.service');
const asyncHandler = require('../utils/asyncHandler');

// ua: Створення нової категорії

exports.createCategory = asyncHandler(async (req, res) => {
  // діставання даних з тіла запиту
  const { name, workspaceId } = req.body; // ua: назвa workspaceId - щоб було зрозуміло (body)

  const category = await categoryService.createCategory(workspaceId, name);

  res.status(201).json({
    success: true,
    data: { category },
  });
});

// ua: Отримання списку категорій для воркспейсу
exports.getWorkspaceCategories = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const categories = await categoryService.getWorkspaceCategories(id);

  res.status(200).json({
    success: true,
    results: categories.length,
    data: { categories },
  });
});

// ua: Оновлення назви категорії

exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const updatedCategory = await categoryService.updateCategory(id, name);

  res.status(200).json({
    success: true,
    data: { category: updatedCategory },
  });
});

// ua: Видалення категорії

exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await categoryService.deleteCategory(id);

  // ua: 204 не передбачає тіла відповіді, тільки статус
  res.status(204).send();
});
