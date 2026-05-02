const express = require('express');
const userController = require('../controllers/user.controller');
// middlewares
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
// validations
const {
  updatePasswordSchema,
  deleteAccountSchema,
} = require('../validations/user.validation');

const router = express.Router();

// ua: всі маршрути користувача вимагають авторизації
router.use(protect);

// ua: PATCH /api/users/update-password
router.patch(
  '/update-password',
  validate(updatePasswordSchema),
  userController.updatePassword,
);

// ua: DELETE /api/users/delete-account
router.delete(
  '/delete-account',
  validate(deleteAccountSchema),
  userController.deleteAccount,
);

module.exports = router;
