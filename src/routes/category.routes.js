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

// ua: Повернення restrictTo, тепер він бачить workspaceId в body

// ua: створення категорії
router.post(
  '/',
  restrictTo('Owner', 'Admin', 'Editor'),
  validate(createCategorySchema),
  categoryController.createCategory,
);

// ua: отримання категорій для воркспейсу
router.get('/workspace/:id', categoryController.getWorkspaceCategories);

// ua: оновлення та видалення категорії за id
router
  .route('/:id')
  .patch(
    restrictTo('Owner', 'Admin', 'Editor'), // ua: захист оновлення
    categoryController.updateCategory,
  )
  .delete(
    restrictTo('Owner', 'Admin'), // ua: тільки власник та адмін можуть видаляти папки
    categoryController.deleteCategory,
  );

module.exports = router;
