// ua: Приймає запит, викликає сервіс і віддає JSON-відповідь (юзає async handler).

// ua: використання сервісу та асинхронного обробника для контролера
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

const tokenUtils = require('../utils/token.utils');
const AppError = require('../utils/appError');
const config = require('../config/index');

// 1 - register
exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  // ua: Генерування токена та встановлення куків
  const tokens = tokenUtils.sendTokensAsCookies(res, result.user.id);

  // ua: запис рефреш-токена у базу даних
  await authService.updateRefreshToken(result.user.id, tokens.refreshToken);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user: result.user },
  });
});

// 2 - login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  // ua: генерування та встановлення куків
  const tokens = tokenUtils.sendTokensAsCookies(res, result.user.id);

  // ua: оновлення рефреш-токена у базі даних
  await authService.updateRefreshToken(result.user.id, tokens.refreshToken);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user: result.user },
  });
});

// 3 - logout
exports.logout = asyncHandler(async (req, res) => {
  // ua: видалення токена із бази (якщо мідлвар protect додав req.user)
  if (req.user) {
    await authService.removeRefreshToken(req.user.id);
  }

  tokenUtils.clearTokensCookies(res);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// 4 - refresh token
exports.refresh = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError('Refresh token missing', 401));
  }

  const user = await authService.findUserByRefreshToken(refreshToken);
  if (!user) {
    return next(new AppError('Invalid refresh token', 403));
  }

  const decoded = tokenUtils.verifyToken(
    refreshToken,
    config.JWT_REFRESH_SECRET,
  );
  if (!decoded) {
    return next(new AppError('Refresh token expired or invalid', 403));
  }

  // ua: видання нового access токена та оновлення рефреш токена
  const tokens = tokenUtils.sendTokensAsCookies(res, user.id);

  // ua: оновлення рефреш-токена у базі даних
  await authService.updateRefreshToken(user.id, tokens.refreshToken);

  res.status(200).json({ success: true });
});
