// ua: Приймає запит, викликає сервіс і віддає JSON-відповідь (юзає async handler).

// ua: використання сервісу та асинхронного обробника для контролера
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const tokenUtils = require('../utils/token.utils');

// ua: обробка реєстрації - приймає дані, викликає сервіс і повертає результат
exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  // ua: встановленя куків в браузер та отримання токенів (якщо треба для логів)
  tokenUtils.sendTokensAsCookies(res, result.user.id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: result.user,
    },
  });
});

// ua: обробка логіну
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  // ua: куки
  tokenUtils.sendTokensAsCookies(res, result.user.id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
    },
  });
});
