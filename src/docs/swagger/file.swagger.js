/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Завантаження та керування файлами (Cloudflare R2)
 */

/**
 * @swagger
 * /api/files/document/{id}:
 *   post:
 *     summary: Завантажити файл до документа
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID документа, до якого прикріплюється файл
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Файл для завантаження
 *     responses:
 *       201:
 *         description: Файл успішно завантажено та збережено у R2
 *       400:
 *         description: Невірний формат файлу або відсутній файл
 *       403:
 *         description: Недостатньо прав для завантаження файлів
 *
 * /api/files/{id}:
 *   delete:
 *     summary: Видалити файл
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID файлу в базі даних
 *     responses:
 *       204:
 *         description: Файл успішно видалено з R2 та бази даних
 *       403:
 *         description: Тільки Owner або Admin можуть видаляти файли
 *       404:
 *         description: Файл не знайдено
 */
