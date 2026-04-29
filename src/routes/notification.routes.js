const express = require('express');

// controllers
const notificationController = require('../controllers/notification.controller');
// middlewares
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
// validations
const { markReadSchema } = require('../validations/notification.validation');

const router = express.Router();

router.use(protect); // ua: всі маршрути сповіщень захищені

// ua: отримання сповіщень для поточного користувача
router.get('/', notificationController.getMyNotifications);

// ua: зазначення конкретного сповіщення як прочитане
router.patch(
  '/:id/read',
  validate(markReadSchema),
  notificationController.markAsRead,
);

module.exports = router;
