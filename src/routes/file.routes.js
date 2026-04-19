const express = require('express');
// controllers
const fileController = require('../controllers/file.controller');
// middlewares
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
// validations
const {
  uploadFileSchema,
  deleteFileSchema,
} = require('../validations/file.validation');

const router = express.Router();

// ua: всі операції з файлами потребують авторизації
router.use(protect);

// ua: завантаження файлу до документа
// ua: використ upload.single('file'), де file - назва поля у form-data
router.post(
  '/document/:id',
  upload.single('file'),
  validate(uploadFileSchema),
  restrictTo('Owner', 'Admin', 'Editor'),
  fileController.uploadFile,
);

// ua: видалення файлу
router.delete(
  '/:id',
  restrictTo('Owner', 'Admin'),
  validate(deleteFileSchema),
  fileController.deleteFile,
);

module.exports = router;
