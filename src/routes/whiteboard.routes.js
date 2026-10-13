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

// Отримання або ініціалізація дошки
router.get(
  '/workspace/:workspaceId',
  restrictTo('Owner', 'Admin', 'Editor', 'Viewer'),
  whiteboardController.getOrCreateWhiteboard,
);

// Збереження графічного стану дошки
router.patch(
  '/:id',
  restrictTo('Owner', 'Admin', 'Editor'),
  validate(updateWhiteboardSchema),
  whiteboardController.updateWhiteboard,
);

module.exports = router;
