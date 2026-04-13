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

    content: z
      .string() // ua: Може бути порожнім, але тип має бути string
      .optional(), // ua: робить поле необов'язковим

    categoryId: z.string().cuid('Invalid category ID'), // ua: перевірка на валідний id категорії
  }),
});

// ua: Схема для оновлення документа

const updateDocumentSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(1, 'Document title must be at least 1 character long.')
      .max(100, 'Document title is too long')
      .optional(), // ua: робить поле не обов., щоб можна було оновити лише контент або лише заголовок
    content: z.string().optional(),
  }),
  params: z.object({
    id: z.string().cuid('Invalid document ID'), // ua: валідація ід документа в урл
  }),
});

module.exports = { createDocumentSchema, updateDocumentSchema };
