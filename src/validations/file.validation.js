const { z } = require('zod');

// ua: Валідація id документа при завантаженні файлу
const uploadFileSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid document ID'),
  }),
});

// ua: Валідація id файлу при видаленні
const deleteFileSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid file ID'),
  }),
});

module.exports = { uploadFileSchema, deleteFileSchema };
