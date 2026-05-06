/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Керування документами, їх версіями та фільтрацією
 */

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Отримати список документів (з пагінацією та фільтрами)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID воркспейсу
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Фільтр за ID категорії
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [PRIVATE, PUBLIC]
 *         description: Фільтр за видимістю
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
 *         description: Кількість документів на сторінку
 *     responses:
 *       200:
 *         description: Успішне отримання списку документів
 *
 *   post:
 *     summary: Створити новий документ
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, categoryId]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [PRIVATE, PUBLIC]
 *     responses:
 *       201:
 *         description: Документ створено
 *
 * /api/documents/{id}:
 *   get:
 *     summary: Отримати документ за ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Дані документа отримано
 *
 *   patch:
 *     summary: Оновити документ (створює нову ревізію автоматично)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [PRIVATE, PUBLIC]
 *     responses:
 *       200:
 *         description: Документ оновлено
 *
 *   delete:
 *     summary: Видалити документ
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Документ видалено
 *
 * /api/documents/{id}/revisions:
 *   get:
 *     summary: Отримати історію змін (ревізій) документа
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список ревізій отримано
 */
