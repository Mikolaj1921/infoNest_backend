const { z } = require('zod');

// ua: валідація для маршрутів сповіщень

const markReadSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid notification ID'), // ua: перевірка id сповіщення url
  }),
});

module.exports = { markReadSchema };
