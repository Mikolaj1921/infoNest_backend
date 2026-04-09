const { z } = require('zod');
// validations for category routes

//ua : Схема для створення категорії

const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string() // ua: перевірка чи рядок
      .trim() // ua: видаляє пробіли з початку та кінця рядка
      .min(3, 'Category name must be at least 3 characters long.')
      .max(30, 'Category name is too long'),

    workspaceId: z.string().cuid('Invalid workspace ID'), // ua: перевірка на валідний id воркспейса
  }),
});

exports = { createCategorySchema };
