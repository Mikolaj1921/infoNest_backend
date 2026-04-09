const { z } = require('zod');
// validation for document routes

// ua: Схема для створення документа

const createDocumentSchema = z.object({
  body: z.object({
    title: z
      .string() // ua: перевірка чи рядок
      .trim() // ua: видаляє пробіли з початку та кінця рядка
      .min(1, 'Document title must be at least 1 character long.')
      .max(100, 'Document title is too long'),
  }),

  content: z
    .string() // ua: Може бути порожнім, але тип має бути string
    .optional(), // ua: робить поле необов'язковим

  categoryId: z.string().cuid('Invalid category ID'), // ua: перевірка на валідний id категорії
});

exports = { createDocumentSchema };
