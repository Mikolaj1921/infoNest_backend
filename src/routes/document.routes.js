const express = require('express');
// controllers
const documentController = require('../controllers/document.controller');
// middlewares
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
// validations
const { createDocumentSchema } = require('../validations/document.validation');

const router = express.Router();

router.use(protect); // ua: всі маршрути документів захищені

// ua: створення документа
router.post(
  '/',
  validate(createDocumentSchema),
  documentController.createDocument,
);

// ua: отримання документа за id, оновлення та видалення
router
  .route('/:id')
  .get(documentController.getDocumentById)
  .patch(documentController.updateDocument)
  .delete(documentController.deleteDocument);

module.exports = router;
