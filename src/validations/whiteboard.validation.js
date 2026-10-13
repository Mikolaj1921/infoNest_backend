// ua: валідація для оновлення таблиці

const { z } = require('zod');

const updateWhiteboardSchema = z.object({
  body: z.object({
    elements: z.array(z.record(z.string(), z.unknown()), {
      required_error: 'Elements array is required',
    }),
    workspaceId: z.string().optional(),
  }),
  query: z.object({ workspaceId: z.string().optional() }),
  params: z.object({ id: z.string() }),
});

module.exports = { updateWhiteboardSchema };
