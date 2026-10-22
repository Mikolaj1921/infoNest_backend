// ua: рути дошки для воркспейсу

const express = require('express');
// controllers
const whiteboardController = require('../controllers/whiteboard.controller');
// middlewares
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  updateWhiteboardSchema,
} = require('../validations/whiteboard.validation');

const router = express.Router();

router.use(protect);

// отримання або ініціалізація дошки
router.get(
  '/workspace/:workspaceId',
  restrictTo('Owner', 'Admin', 'Editor', 'Viewer'),
  whiteboardController.getOrCreateWhiteboard,
);

// збереження графічного стану дошки
router.patch(
  '/:id',
  restrictTo('Owner', 'Admin', 'Editor'),
  validate(updateWhiteboardSchema),
  whiteboardController.updateWhiteboard,
);

// налаштування
router.patch(
  '/:id/settings',
  restrictTo('Owner', 'Admin', 'Editor'),
  whiteboardController.updateWhiteboardSettings,
);

module.exports = router;
