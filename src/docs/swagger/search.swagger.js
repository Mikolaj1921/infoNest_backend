/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Глобальний пошук по всій системі
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Глобальний пошук по документах та категоріях
 *     description: Шукає збіги в назвах категорій та в назвах/контенті документів у всіх доступних користувачу воркспейсах.
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Пошуковий запит (мінімум 2 символи)
 *     responses:
 *       200:
 *         description: Результати пошуку знайдені
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
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalResults:
 *                       type: integer
 *       400:
 *         description: Запит занадто короткий (менше 2 символів)
 *       401:
 *         description: Необхідна авторизація
 */
