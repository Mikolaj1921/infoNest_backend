const express = require('express');
// controllers
const documentController = require('../controllers/document.controller');
// middlewares
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
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
  restrictTo('Owner', 'Admin', 'Editor'), // ua: тільки власник, адмін та редактор можуть створювати документи
  validate(createDocumentSchema),
  documentController.createDocument,
);

// ua: ревізія(історія) документа - отримання всіх ревізій для документа
router.get('/:id/revisions', documentController.getDocumentRevisions);

// ua: отримання документа за id, оновлення та видалення
router
  .route('/:id')
  .get(documentController.getDocumentById) // ua: отримання документа за id
  .patch(
    restrictTo('Owner', 'Admin', 'Editor'), // ua: захист оновлення
    validate(updateDocumentSchema),
    documentController.updateDocument,
  )
  .delete(
    restrictTo('Owner', 'Admin'), // ua: тільки високі ролі можуть видаляти
    documentController.deleteDocument,
  );

module.exports = router;
