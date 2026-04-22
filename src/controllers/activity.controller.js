// ua: контролер для отримання стрічки активності воркспейсу
const activityService = require('../services/activity.service');
const asyncHandler = require('../utils/asyncHandler');

exports.getWorkspaceActivity = asyncHandler(async (req, res) => {
  const { id } = req.params; // ua: ід воркспейсу

  const activity = await activityService.getWorkspaceActivity(id);

  res.status(200).json({
    success: true,
    results: activity.length,
    data: { activity },
  });
});
