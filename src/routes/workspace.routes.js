const express = require('express');
const workspaceController = require('../controllers/workspace.controller');
const validate = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware'); // Middleware для захисту маршрутів
const {
  createWorkspaceSchema,
  updateWorkspaceSchema,
} = require('../validations/workspace.validation');

const router = express.Router();

// ua: Всі маршрути нижче вимагають авторизації
router.use(protect);

router
  .route('/')
  .post(validate(createWorkspaceSchema), workspaceController.createWorkspace) // ua: Створення workspace
  .get(workspaceController.getAllWorkspaces); // Отримання списку - workspaces

router
  .route('/:id')
  .patch(validate(updateWorkspaceSchema), workspaceController.updateWorkspace) // Оновлення workspace
  .delete(workspaceController.deleteWorkspace); // Видалення workspace

module.exports = router;
