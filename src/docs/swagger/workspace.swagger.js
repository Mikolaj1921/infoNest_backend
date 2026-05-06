/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: Керування робочими просторами, учасниками та стрічкою активності
 */

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: Отримати список усіх воркспейсів користувача
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Список воркспейсів отримано
 *
 *   post:
 *     summary: Створити новий воркспейс
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [PRIVATE, PUBLIC]
 *     responses:
 *       201:
 *         description: Воркспейс створено
 *
 * /api/workspaces/{id}:
 *   patch:
 *     summary: Оновити налаштування воркспейсу
 *     tags: [Workspaces]
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
 *               name:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [PRIVATE, PUBLIC]
 *     responses:
 *       200:
 *         description: Воркспейс оновлено
 *
 *   delete:
 *     summary: Видалити воркспейс
 *     tags: [Workspaces]
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
 *         description: Воркспейс видалено
 *
 * /api/workspaces/{id}/activity:
 *   get:
 *     summary: Отримати стрічку активності воркспейсу
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Стрічка активності отримана
 *
 * /api/workspaces/{id}/members:
 *   post:
 *     summary: Додати нового учасника до воркспейсу
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Owner, Admin, Editor, Viewer, Guest]
 *     responses:
 *       201:
 *         description: Учасника додано
 *
 * /api/workspaces/{id}/members/{userId}:
 *   patch:
 *     summary: Змінити роль учасника
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [Owner, Admin, Editor, Viewer, Guest]
 *     responses:
 *       200:
 *         description: Роль оновлено
 *
 *   delete:
 *     summary: Видалити учасника з воркспейсу
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Учасника видалено
 */
