// ua: маршрути для категорій завдань (columns)

const express = require('express');
// controller
const taskCategoryController = require('../controllers/taskCategory.controller');
// middlewares
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
// validation schemas
const {
  createTaskCategorySchema,
  updateTaskCategorySchema,
} = require('../validations/kanban.validation');

const router = express.Router();

router.use(protect); // всі маршрути нижче будуть захищені (must be authenticated)

router.get(
  '/workspace/:workspaceId',
  restrictTo('Owner', 'Admin', 'Editor', 'Viewer'),
  taskCategoryController.getWorkspaceCategories,
);

router.post(
  '/',
  restrictTo('Owner', 'Admin', 'Editor'),
  validate(createTaskCategorySchema),
  taskCategoryController.createCategory,
);

router
  .route('/:id')
  .patch(
    restrictTo('Owner', 'Admin', 'Editor'),
    validate(updateTaskCategorySchema),
    taskCategoryController.updateCategory,
  )
  .delete(
    restrictTo('Owner', 'Admin'), // видаляти колонки можуть тільки адм і власник
    taskCategoryController.deleteCategory,
  );

module.exports = router;
