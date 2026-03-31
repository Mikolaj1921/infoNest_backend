const jwt = require('jsonwebtoken');
const config = require('../config/index');

// ua: базові налаштування для захищених кук
const cookieOptions = {
  httpOnly: true, // захист від XSS - неможливість доступу до куки через JS
  secure: config.NODE_ENV === 'production', // !тільки HTTPS у продакшені
  sameSite: 'strict', // захист від CSRF - кросс-сайт запити
};

// ua: базова функція генерації підписаного токена
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = {
  // ua: короткотривалий токен доступу(token access)
  generateAccessToken: (userId) => {
    return generateToken({ id: userId }, config.JWT_ACCESS_SECRET, '15m');
  },

  // ua: довготривалий токен оновлення - token refresh
  generateRefreshToken: (userId) => {
    return generateToken({ id: userId }, config.JWT_REFRESH_SECRET, '7d');
  },

  // ua: перевірка валідності токена
  verifyToken: (token, secret) => {
    try {
      return jwt.verify(token, secret);
    } catch {
      return null;
    }
  },

  // ua: встановлення токенів у куки браузера
  sendTokensAsCookies: (res, userId) => {
    const accessToken = module.exports.generateAccessToken(userId);
    const refreshToken = module.exports.generateRefreshToken(userId);

    // кука для access токена (15 хв)
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    // кука для refresh токена (7 днів)
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken, refreshToken };
  },

  // ua: видалення токенів із кук (для Logout)
  clearTokensCookies: (res) => {
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
  },
};
