// ua: тут знаходиться логіка авторизації та аутентифікації користувачів.

const bcrypt = require('bcryptjs'); // ua: Бібліотека для хешування паролів
const { PrismaClient } = require('@prisma/client'); // ua: PrismaClient для взаємодії з db
const AppError = require('../utils/appError'); // ua: Клас для обробки помилок у додатку
const tokenUtils = require('../utils/token.utils'); // ua: Утиліти для генерації та верифікації токенів

const prisma = new PrismaClient();

class AuthService {
  // ua: Логіка реєстрації - user
  async register(userData) {
    const { email, password, name } = userData;

    // перевірка email - наявність юзера з таким email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('A user with this email already exists.', 400);
    }

    // bcrypt - хешування пароля (salt 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Створення користувача по схемі призми
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true }, // ua: без повтору хешу пароля
    });

    // генерація пари токенів
    const accessToken = tokenUtils.generateAccessToken(newUser.id);
    const refreshToken = tokenUtils.generateRefreshToken(newUser.id);

    return { user: newUser, accessToken, refreshToken };
  }

  // ua: Логіка входу
  async login(email, password) {
    // пошук юзера по email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    if (!user) {
      throw new AppError('Incorrect email or password', 401);
    }

    // порівняння пароля з хешем в базі
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError('Incorrect email or password', 401);
    }

    // генерація пари токенів
    const accessToken = tokenUtils.generateAccessToken(user.id);
    const refreshToken = tokenUtils.generateRefreshToken(user.id);

    // видалення пароля з об'єкта користувача перед поверненням
    delete user.password;

    return { user, accessToken, refreshToken };
  }
}

module.exports = new AuthService();
