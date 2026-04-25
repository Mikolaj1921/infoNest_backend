// ua: контролер для глобального пошуку по документам та категоріям

const searchService = require('../services/search.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// ua: Глобальний пошук

// rules: params - id, body - categoryId

exports.globalSearch = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const userId = req.user.id;

  if (!query) {
    throw new AppError('Query parameter is required', 400);
  }

  // ua: виклик сервісу для виконання пошуку з урахуванням прав доступу користувача
  const results = await searchService.globalSearch(userId, query);

  // ua: повернення результатів пошуку з кількістю знайдених документів та категорій
  res.status(200).json({
    success: true,
    data: {
      documents: results.documents,
      categories: results.categories,
      totalResults: results.documents.length + results.categories.length,
    },
  });
});
