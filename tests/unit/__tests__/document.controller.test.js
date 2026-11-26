
const documentService = require('../../../src/services/document.service');
const documentController = require('../../../src/controllers/document.controller');

// ua: мок сервісу документів
jest.mock('../../../src/services/document.service', () => ({
    getAllDocuments: jest.fn(),
    createDocument: jest.fn(),
    getDocumentFiles: jest.fn(),
    getDocumentById: jest.fn(),
    updateDocument: jest.fn(),
    getDocumentRevisions: jest.fn(),
    deleteDocument: jest.fn(),
}));

describe('Document Controller Unit Tests', () => {
    let req;
    let res;
    let next;

    const mockDocument = {
        id: 'document-123',
        title: 'Test Document',
        content: 'Test content',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: { id: 'document-123' },
            query: {},
            body: {},
            user: { id: 'user-123' },
        };

        // ua: мок об'єкта відповіді Express
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };

        next = jest.fn();
    });

    // ua: отримання списку документів
    describe('getAllDocuments', () => {
        test('should successfully get all documents', async () => {
            const result = {
                documents: [mockDocument],
                pagination: {
                    page: 1,
                    limit: 10,
                    totalCount: 1,
                    totalPages: 1,
                },
            };

            req.query = {
                workspaceId: 'workspace-123',
                page: '1',
                limit: '10',
            };

            documentService.getAllDocuments.mockResolvedValue(result);

            await documentController.getAllDocuments(req, res, next);

            expect(documentService.getAllDocuments).toHaveBeenCalledWith(
                'workspace-123',
                req.query,
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: result,
            });
        });

        test('should get workspaceId from request body if query does not contain it', async () => {
            const result = { documents: [], pagination: {} };

            req.query = { page: '1' };
            req.body = { workspaceId: 'workspace-from-body' };

            documentService.getAllDocuments.mockResolvedValue(result);

            await documentController.getAllDocuments(req, res, next);

            expect(documentService.getAllDocuments).toHaveBeenCalledWith(
                'workspace-from-body',
                req.query,
            );
        });
    });

    // ua: створення документа
    describe('createDocument', () => {
        test('should successfully create a document', async () => {
            const body = {
                title: 'New Document',
                content: 'New content',
                categoryId: 'category-123',
            };

            req.body = body;

            documentService.createDocument.mockResolvedValue(mockDocument);

            await documentController.createDocument(req, res, next);

            expect(documentService.createDocument).toHaveBeenCalledWith(
                'user-123',
                'category-123',
                body,
            );

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { document: mockDocument },
            });
        });
    });

    // ua: отримання прикріплених файлів документа
    describe('getDocumentFiles', () => {
        test('should successfully get document files', async () => {
            const files = [
                {
                    id: 'file-123',
                    fileName: 'document.pdf',
                    documentId: 'document-123',
                },
            ];

            documentService.getDocumentFiles.mockResolvedValue(files);

            await documentController.getDocumentFiles(req, res, next);

            expect(documentService.getDocumentFiles).toHaveBeenCalledWith(
                'document-123',
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: files,
            });
        });
    });

    // ua: отримання документа за ID
    describe('getDocumentById', () => {
        test('should successfully get document details', async () => {
            documentService.getDocumentById.mockResolvedValue(mockDocument);

            await documentController.getDocumentById(req, res, next);

            expect(documentService.getDocumentById).toHaveBeenCalledWith(
                'document-123',
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { document: mockDocument },
            });
        });
    });

    // ua: оновлення документа
    describe('updateDocument', () => {
        test('should successfully update a document', async () => {
            const body = { content: 'Updated content' };
            const updatedDocument = {
                ...mockDocument,
                content: 'Updated content',
            };

            req.body = body;

            documentService.updateDocument.mockResolvedValue(updatedDocument);

            await documentController.updateDocument(req, res, next);

            expect(documentService.updateDocument).toHaveBeenCalledWith(
                'document-123',
                'user-123',
                body,
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { document: updatedDocument },
            });
        });
    });

    // ua: отримання історії ревізій документа
    describe('getDocumentRevisions', () => {
        test('should successfully get document revisions', async () => {
            const revisions = [
                { id: 'revision-1', content: 'Old content' },
                { id: 'revision-2', content: 'Older content' },
            ];

            documentService.getDocumentRevisions.mockResolvedValue(revisions);

            await documentController.getDocumentRevisions(req, res, next);

            expect(documentService.getDocumentRevisions).toHaveBeenCalledWith(
                'document-123',
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                results: 2,
                data: { revisions },
            });
        });

        test('should return zero results if document has no revisions', async () => {
            documentService.getDocumentRevisions.mockResolvedValue([]);

            await documentController.getDocumentRevisions(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                results: 0,
                data: { revisions: [] },
            });
        });
    });

    // ua: видалення документа
    describe('deleteDocument', () => {
        test('should successfully delete a document', async () => {
            documentService.deleteDocument.mockResolvedValue(mockDocument);

            await documentController.deleteDocument(req, res, next);

            expect(documentService.deleteDocument).toHaveBeenCalledWith(
                'document-123',
            );

            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });
    });

    // ua: передавання помилок із сервісу до обробника Express
    describe('Error handling', () => {
        test('should pass service errors to next middleware', async () => {
            const error = new Error('Document not found');

            documentService.getDocumentById.mockRejectedValue(error);

            const req = {
                params: { id: 'document-id' },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();

            await documentController.getDocumentById(req, res, next);

            // ua: очікуємо передачу помилки в наступний middleware
            await new Promise((resolve) => setImmediate(resolve));

            expect(next).toHaveBeenCalledWith(error);
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
