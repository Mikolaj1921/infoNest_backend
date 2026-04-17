// ua: контролер для роботи з файлами

const fileService = require('../services/file.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// ua: Завантаження файлу

// rules: params - id, body - categoryId

exports.uploadFile = asyncHandler(async (req, res) => {
  const { id } = req.params; // id документа

  // ua: технічна перевірка наявності файлу в запиті
  if (!req.file) {
    throw new AppError('Please upload a file', 400);
  }

  const file = await fileService.uploadFile(req.file, id, req.user.id);

  res.status(201).json({
    success: true,
    data: { file },
  });
});

// ua: Видалення файлу

exports.deleteFile = asyncHandler(async (req, res) => {
  const { id } = req.params; // id файлу

  await fileService.deleteFile(id);

  res.status(204).send();
});
