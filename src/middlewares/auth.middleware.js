const jwt = require('jsonwebtoken');
const config = require('../config/index');
const AppError = require('../utils/appError');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// ua: Middleware для захисту роутів (перевірка Access Token)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // oтримання токена з кук (або з заголовка Authorization для тестів)
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Unauthorized. Please log in to continue.', 401));
  }

  // верифікація токена - отримання даних
  const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);

  // перевірка, чи користувач існує в базі
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, name: true, email: true },
  });

  if (!currentUser) {
    return next(
      new AppError(
        'The user associated with this token no longer exists.',
        401,
      ),
    );
  }

  // апд - дані юзера в об'єкт запиту для наступних мідлварів/контролерів
  req.user = currentUser;
  next();
});

module.exports = { protect };
