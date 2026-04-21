const { z } = require('zod');
// ua: валідація для маршрутів активності

const getWorkspaceActivitySchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid workspace ID'), // ua: перевірка id воркспейсу url
  }),
});

module.exports = { getWorkspaceActivitySchema };
