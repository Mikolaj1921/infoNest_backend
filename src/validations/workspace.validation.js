const { z } = require('zod');
// validations for workspace routes

// ua: Схема для створення воркспейсу
const createWorkspaceSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, 'The name must be at least 3 characters long.')
      .max(50, 'The title is too long'),
    visibility: z.enum(['PRIVATE', 'PUBLIC']).optional().default('PRIVATE'),
  }),
});

// ua: Схема для оновлення воркспейсу
const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(50).optional(),
    visibility: z.enum(['PRIVATE', 'PUBLIC']).optional(),
  }),
  params: z.object({
    id: z.string().cuid('Incorrect workspace ID'),
  }),
});

module.exports = {
  createWorkspaceSchema,
  updateWorkspaceSchema,
};
