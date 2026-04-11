const express = require('express');
// controllers
const categoryController = require('../controllers/category.controller');
// middlewares
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
// validations
const { createCategorySchema } = require('../validations/category.validation');

const router = express.Router();

router.use(protect); // ua: всі маршрути категорій захищені

// ua: створення та отримання категорій воркспейсу
// маршрут буде виглядати як /api/v1/categories/workspace/:id

router.post(
  '/',
  restrictTo('Owner', 'Admin', 'Editor'),
  validate(createCategorySchema),
  categoryController.createCategory,
);
router.get('/workspace/:id', categoryController.getWorkspaceCategories);

// ua: дії з конкретною категорією
router
  .route('/:id') // ua: id категорії в параметрах
  .patch(
    restrictTo('Owner', 'Admin', 'Editor'),
    categoryController.updateCategory,
  ) // ua: оновлення назви категорії
  .delete(restrictTo('Owner', 'Admin'), categoryController.deleteCategory); // ua: видалення категорії

module.exports = router;
