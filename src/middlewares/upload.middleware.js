// ua: init multer для обробки завантаження файлів
const multer = require('multer');
const AppError = require('../utils/appError');

// ua: memoryStorage, щоб не зберігати файли на диску сервера
const storage = multer.memoryStorage();

// ua: Фільтр файлів (лише PDF та зображення)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Unsupported file type. Only PDF files and images are allowed.',
        400,
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // ua: ліміт 5мб - тестовий
  },
});

module.exports = upload;
