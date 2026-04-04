const { z } = require('zod');

// ua: Схема для додавання учасника у воркспейс
const addMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    role: z.enum(['Admin', 'Editor', 'Viewer', 'Guest'], {
      errorMap: () => ({ message: 'Invalid role selected' }),
    }),
  }),
  params: z.object({
    id: z.string().cuid('Invalid workspace ID'),
  }),
});

// ua: Схема для зміни ролі існуючого учасника
const updateMemberRoleSchema = z.object({
  body: z.object({
    // ua: pоль може бути одна з перерахованих
    role: z.enum(['Admin', 'Editor', 'Viewer', 'Guest'], {
      errorMap: () => ({ message: 'Invalid role selected' }),
    }),
  }),
  params: z.object({
    id: z.string().cuid('Workspace ID is required'),
    userId: z.string().cuid('User ID is required'),
  }),
});

module.exports = {
  addMemberSchema,
  updateMemberRoleSchema,
};
