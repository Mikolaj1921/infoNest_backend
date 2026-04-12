// ua: контролер для документів - створення, отримання, оновлення, видалення

const documentService = require('../services/document.service');
const asyncHandler = require('../utils/asyncHandler');

// ua: Створення нового документа

// rules: params - id, body - categoryId

exports.createDocument = asyncHandler(async (req, res) => {
  const userId = req.user.id; // ua: id юзера з протекта (middleware auth)
  const { categoryId } = req.body; // ua: id категорії

  const document = await documentService.createDocument(
    userId,
    categoryId,
    req.body,
  );

  res.status(201).json({
    success: true,
    data: { document },
  });
});

// ua: Отримання документа за id
exports.getDocumentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const document = await documentService.getDocumentById(id);

  res.status(200).json({
    success: true,
    data: { document },
  });
});

// ua: Оновлення документа
exports.updateDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ua: оновлення документа
  const updatedDocument = await documentService.updateDocument(
    id,
    req.user.id,
    req.body,
  );

  // ua: відповідь клієнту з оновленим документом
  res.status(200).json({
    success: true,
    data: { document: updatedDocument },
  });
});

// ua: Отримання історії документа (ревізій)
exports.getDocumentRevisions = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ua: отримання ревізій документа
  const revisions = await documentService.getDocumentRevisions(id);

  // ua: відповідь клієнту з кількістю ревізій та їх даними
  res.status(200).json({
    success: true,
    results: revisions.length,
    data: { revisions },
  });
});

// ua: Видалення документа
exports.deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await documentService.deleteDocument(id);

  // ua: 204 не передбачає тіла відповіді, тільки статус
  res.status(204).send();
});
