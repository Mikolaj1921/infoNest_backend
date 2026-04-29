// ua: контролер для керування сповіщеннями користувачів

const notificationService = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');

// ua: отримання сповіщень для поточного користувача
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const notifications = await notificationService.getUserNotifications(userId);

  res.status(200).json({
    success: true,
    results: notifications.length,
    data: { notifications },
  });
});

// ua: зазначення конкретного сповіщення як прочитане
exports.markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  await notificationService.markAsRead(id, userId);

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
  });
});
