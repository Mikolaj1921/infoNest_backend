const express = require('express');
// controllers
const documentController = require('../controllers/document.controller');
// middlewares
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
// validations
const {
  createDocumentSchema,
  updateDocumentSchema,
} = require('../validations/document.validation');

const router = express.Router();

router.use(protect); // ua: всі маршрути документів захищені

// ua: створення документа
router.post(
  '/',
  validate(createDocumentSchema),
  documentController.createDocument,
);

// ua: ревізія(історія) документа - отримання всіх ревізій для документа
router.get('/:id/revisions', documentController.getDocumentRevisions);

// ua: отримання документа за id, оновлення та видалення
router
  .route('/:id')
  .get(documentController.getDocumentById) // ua: отримання документа за id
  .patch(validate(updateDocumentSchema), documentController.updateDocument) // ua: оновлення документа з валідацією даних
  .delete(documentController.deleteDocument); // ua: видалення документа

module.exports = router;
