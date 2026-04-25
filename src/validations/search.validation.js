const { z } = require('zod');

// ua: валідація для рядка пошуку
const globalSearchSchema = z.object({
  // ua: валідація безпосередньо параметра запиту, так як він передається через req.query
  query: z.object({
    query: z
      .string({
        required_error: 'Search query is required',
      })
      .trim()
      .min(2, 'Search query must be at least 2 characters long'),
  }),
});

module.exports = { globalSearchSchema };
