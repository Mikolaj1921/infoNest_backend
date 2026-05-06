/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Керування категоріями (папками) документів у воркспейсах
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Створити нову категорію
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceId, name]
 *             properties:
 *               workspaceId:
 *                 type: string
 *                 description: ID воркспейсу, до якого належить категорія
 *               name:
 *                 type: string
 *                 description: Назва категорії
 *     responses:
 *       201:
 *         description: Категорія успішно створена
 *       403:
 *         description: Недостатньо прав для створення категорії
 *
 * /api/categories/workspace/{id}:
 *   get:
 *     summary: Отримати всі категорії воркспейсу
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID воркспейсу
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
 *         description: Кількість записів на сторінці
 *     responses:
 *       200:
 *         description: Список категорій з пагінацією
 *
 * /api/categories/{id}:
 *   patch:
 *     summary: Оновити назву категорії
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID категорії
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Категорія оновлена
 *   delete:
 *     summary: Видалити категорію
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID категорії
 *     responses:
 *       204:
 *         description: Категорія видалена
 */
