// ua: контролер для отримання стрічки активності воркспейсу
const activityService = require('../services/activity.service');
const asyncHandler = require('../utils/asyncHandler');

exports.getWorkspaceActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ua: update - пагінація для стрічки активності воркспейсу - отримуємо параметри пагінації
  // з query (page, limit) і передаємо їх у сервіс
  const result = await activityService.getWorkspaceActivity(id, req.query);

  res.status(200).json({
    success: true,
    data: result, // ua: масив activity, і об'єкт pagination (замість окремого поля totalCount)
  });
});
