const jwt = require('jsonwebtoken');
const config = require('../config/index');

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
};
