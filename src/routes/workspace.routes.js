const express = require('express');
// controllers
const workspaceController = require('../controllers/workspace.controller');
const memberController = require('../controllers/member.controller');
// middlewares
const validate = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware'); // ua: Middleware для захисту маршрутів
const { restrictTo } = require('../middlewares/role.middleware'); // ua: Middleware для обмеження доступу за ролями
//validations
const {
  createWorkspaceSchema,
  updateWorkspaceSchema,
} = require('../validations/workspace.validation'); // ua: Схеми валідації для створення та оновлення воркспейсу
const {
  addMemberSchema,
  updateMemberRoleSchema,
} = require('../validations/member.validation'); // ua: Схеми валідації для додавання учасника та оновлення ролі учасника

const router = express.Router();

// ua: Всі маршрути нижче вимагають авторизації
router.use(protect);

// Воркспейси
// ua: / - для створення та отримання списку воркспейсів
router
  .route('/')
  .post(validate(createWorkspaceSchema), workspaceController.createWorkspace) // ua: Створення workspace
  .get(workspaceController.getAllWorkspaces); // ua: Отримання списку - workspaces

// ua: /:id - для отримання, оновлення та видалення конкретного воркспейсу
router
  .route('/:id')
  .patch(validate(updateWorkspaceSchema), workspaceController.updateWorkspace) // ua: Оновлення workspace
  .delete(workspaceController.deleteWorkspace); // ua: Видалення workspace

// Учасники (Membership & RBAC)
// ua: Тільки Owner та Admin мають право керувати учасниками
// :id - ID воркспейсу

router.use('/:id/members', restrictTo('Owner', 'Admin')); // ua: Middleware для обмеження доступу до маршрутів керування учасниками

// ua: /:id/members - додавання учасника до воркспейсу
router
  .route('/:id/members')
  .post(validate(addMemberSchema), memberController.addMember);

router
  .route('/:id/members/:userId') // fixed named param (memberId to userId)
  .patch(validate(updateMemberRoleSchema), memberController.updateMemberRole) // ua: Оновлення ролі учасника
  .delete(memberController.removeMember); // ua: Видалення учасника з воркспейсу

module.exports = router;
