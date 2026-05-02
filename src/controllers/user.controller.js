// ua: контролер для керування профілем користувача
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const tokenUtils = require('../utils/token.utils');

// ua: зміна пароля
exports.updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // ua: виклик сервіс (він перевірить старий пароль та захешує новий)
  await authService.updatePassword(req.user.id, oldPassword, newPassword);

  // ua: очищення куки (Session Reset), щоб змусити юзера залогінитися знову
  tokenUtils.clearTokensCookies(res);

  res.status(200).json({
    success: true,
    message:
      'Password updated successfully. Please log in again with your new password.',
  });
});

// ua: видалення акаунта
exports.deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  // ua: викликаємо сервіс (він видалить файли з R2 та всі дані з БД)
  await authService.deleteAccount(req.user.id, password);

  // ua: очищуємо куки після видалення
  tokenUtils.clearTokensCookies(res);

  res.status(200).json({
    success: true,
    message:
      'Your account and all associated data have been permanently deleted.',
  });
});
