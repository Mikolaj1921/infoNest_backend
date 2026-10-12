// boardTask routes

const express = require('express');
// controllers
const boardTaskController = require('../controllers/boardTask.controller');
// middlewares
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
// validations
const {
  createBoardTaskSchema,
  updateBoardTaskSchema,
  reorderTasksSchema,
} = require('../validations/kanban.validation');

const router = express.Router();

router.use(protect);

// роут швидкого перетягування карток між колонками
router.patch(
  '/reorder',
  restrictTo('Owner', 'Admin', 'Editor'),
  validate(reorderTasksSchema),
  boardTaskController.reorderTasks,
);

router.post(
  '/',
  restrictTo('Owner', 'Admin', 'Editor'),
  validate(createBoardTaskSchema),
  boardTaskController.createTask,
);

router
  .route('/:id')
  .patch(
    restrictTo('Owner', 'Admin', 'Editor'),
    validate(updateBoardTaskSchema),
    boardTaskController.updateTask,
  )
  .delete(
    restrictTo('Owner', 'Admin', 'Editor'),
    boardTaskController.deleteTask,
  );

// роути для лінкування внутрішніх документів до карток задач
router.post(
  '/:id/attachments',
  restrictTo('Owner', 'Admin', 'Editor'),
  boardTaskController.linkDocument,
);

router.delete(
  '/:id/attachments/:docId',
  restrictTo('Owner', 'Admin', 'Editor'),
  boardTaskController.unlinkDocument,
);

module.exports = router;
