const { z } = require('zod');

// ua: валідація для рядка пошуку
const globalSearchSchema = z.object({
  query: z.object({
    q: z
      .string()
      .trim()
      .min(2, 'Search query must be at least 2 characters long'),
  }),
});

module.exports = { globalSearchSchema };
