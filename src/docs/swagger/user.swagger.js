/**
 * @swagger
 * tags:
 *   name: User
 *   description: Керування профілем користувача та безпекою акаунта
 */

/**
 * @swagger
 * /api/users/update-password:
 *   patch:
 *     summary: Зміна пароля користувача
 *     description: Дозволяє змінити пароль, надавши старий для підтвердження. Після успішної зміни всі активні сесії (refresh tokens) анулюються.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Пароль успішно змінено
 *       401:
 *         description: Невірний старий пароль
 *
 * /api/users/delete-account:
 *   delete:
 *     summary: Повне видалення акаунта
 *     description: Назавжди видаляє користувача, його воркспейси, документи та файли з хмарного сховища R2. Вимагає підтвердження паролем.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Акаунт та всі пов'язані дані успішно видалені
 *       401:
 *         description: Невірний пароль. Видалення скасовано.
 *       404:
 *         description: Користувача не знайдено
 */
