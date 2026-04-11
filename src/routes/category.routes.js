const express = require('express');
// controllers
const categoryController = require('../controllers/category.controller');
// middlewares
const { protect } = require('../middlewares/auth.middleware');
//const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
// validations
const { createCategorySchema } = require('../validations/category.validation');

const router = express.Router();

router.use(protect); // ua: всі маршрути категорій захищені

// ua: створення та отримання категорій воркспейсу
// маршрут буде виглядати як /api/v1/categories/workspace/:id

// ua: Тимчасово видал restrictTo з POST, бо він не бачить ід воркспейсу в параметрах
router.post(
  '/',
  validate(createCategorySchema),
  categoryController.createCategory,
);

router.get('/workspace/:id', categoryController.getWorkspaceCategories);

router
  .route('/:id')
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
