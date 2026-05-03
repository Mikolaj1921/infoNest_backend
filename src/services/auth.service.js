const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const prisma = require('../config/db');
const activityService = require('./activity.service'); // ua:  сервіс активності

// ua: сервіс для реєстрації та логіну користувачів
class AuthService {
  async register(userData) {
    const { email, password, name } = userData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('A user with this email already exists.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true },
    });

    return { user: newUser };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    if (!user) {
      throw new AppError('Incorrect email or password', 401);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError('Incorrect email or password', 401);
    }

    delete user.password;

    return { user };
  }

  // ua: Оновлення рефреш токена в базі
  async updateRefreshToken(userId, refreshToken) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  // ua: пошук користувача за рефреш токеном
  async findUserByRefreshToken(token) {
    return await prisma.user.findFirst({
      where: { refreshToken: token },
    });
  }

  // ua: видалення рефреш токена (Logout)
  async removeRefreshToken(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // ua: Метод для зміни пароля з перевіркою старого та скиданням сесій (Session Reset)
  async updatePassword(userId, oldPassword, newPassword) {
    // ua: пошук користувача в базі для отримання поточного хешу пароля
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // ua: чек - чи введений старий пароль відповідає дійсності
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      throw new AppError('The current password you entered is incorrect', 401);
    }

    // ua: хеш - новий пароль перед збереженням
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // ua: оновлюється пароль та видаляється refreshToken (Session Reset),
    // щоб користувач розлогінився на всіх пристроях задля безпеки
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        refreshToken: null,
      },
    });

    // ua: логування зміни пароля (workspaceId = null для системних дій профілю)
    activityService.logActivity(null, userId, 'PASSWORD_CHANGED');

    return updatedUser;
  }

  // ua: Видалення акаунта користувача з повним очищенням хмарного сховища
  async deleteAccount(userId, password) {
    // ua: пошук користувача разом із його файлами
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { files: true }, // ua: підтягуємо всі файли користувача
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // ua: перевірка - пароль перед видаленням
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError(
        'Incorrect password. Account deletion cancelled.',
        401,
      );
    }

    // ua: Видаляємо файли з Cloudflare R2
    const fileService = require('./file.service'); // ua: імпортуємо сервіс файлів локально

    // ua: чек по всіх файлах користувача та видаляємо їх із хмари
    const deleteFilesPromises = user.files.map((file) =>
      fileService.deleteFile(file.id).catch((err) => {
        console.error(`Failed to delete file ${file.id} from R2:`, err.message);
      }),
    );

    await Promise.all(deleteFilesPromises);

    // ua: логування видалення акаунта перед очищенням БД
    activityService.logActivity(null, userId, 'ACCOUNT_DELETED');

    // ua: DB CLEANUP: Видаляємо юзера (Prisma Cascade видалить воркспейси, документи, активність і т.д.)
    return await prisma.user.delete({
      where: { id: userId },
    });
  }
}

module.exports = new AuthService();
