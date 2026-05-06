/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Система внутрішніх сповіщень користувача (In-app)
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Отримати список сповіщень поточного користувача
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер сторінки
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Кількість сповіщень на сторінці
 *     responses:
 *       200:
 *         description: Успішне отримання сповіщень з пагінацією
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Позначити сповіщення як прочитане
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID сповіщення
 *     responses:
 *       200:
 *         description: Сповіщення успішно оновлено
 *       403:
 *         description: Спроба змінити чуже сповіщення
 *       404:
 *         description: Сповіщення не знайдено
 */
