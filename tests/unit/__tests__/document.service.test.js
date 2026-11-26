
// ua: unit-тести для сервісу документів

jest.mock('../../../src/config/db', () => ({
    document: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    category: {
        findUnique: jest.fn(),
    },
    file: {
        findMany: jest.fn(),
    },
    revision: {
        findMany: jest.fn(),
        create: jest.fn(),
    },
    $transaction: jest.fn(),
}));

jest.mock('../../../src/services/activity.service', () => ({
    logActivity: jest.fn(),
}));

jest.mock('../../../src/utils/pagination', () => ({
    getPagination: jest.fn(),
}));

const prisma = require('../../../src/config/db');
const activityService = require('../../../src/services/activity.service');
const { getPagination } = require('../../../src/utils/pagination');
const documentService = require('../../../src/services/document.service');

describe('DocumentService', () => {
    const userId = 'user-123';
    const documentId = 'document-123';
    const categoryId = 'category-123';
    const workspaceId = 'workspace-123';

    const mockDocument = {
        id: documentId,
        title: 'Test Document',
        content: '<p>Test content</p>',
        categoryId,
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        getPagination.mockReturnValue({
            skip: 0,
            take: 10,
            page: 1,
            limit: 10,
        });

        // ua: імітація транзакції з передачею mock-об'єкта Prisma
        prisma.$transaction.mockImplementation(async (callback) => {
            return callback({
                revision: {
                    create: prisma.revision.create,
                },
                document: {
                    update: prisma.document.update,
                },
            });
        });
    });

    // ua: тести отримання списку документів
    describe('getAllDocuments', () => {
        test('should return documents with pagination metadata', async () => {
            const documents = [mockDocument];

            prisma.document.findMany.mockResolvedValue(documents);
            prisma.document.count.mockResolvedValue(1);

            const result = await documentService.getAllDocuments(
                workspaceId,
                {},
            );

            expect(getPagination).toHaveBeenCalledWith({});
            expect(prisma.document.findMany).toHaveBeenCalledWith({
                where: {
                    category: { workspaceId },
                },
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: { select: { name: true } },
                    owner: { select: { name: true } },
                },
            });

            expect(prisma.document.count).toHaveBeenCalledWith({
                where: {
                    category: { workspaceId },
                },
            });

            expect(result).toEqual({
                documents,
                pagination: {
                    page: 1,
                    limit: 10,
                    totalCount: 1,
                    totalPages: 1,
                },
            });
        });

        test('should apply category and visibility filters', async () => {
            prisma.document.findMany.mockResolvedValue([]);
            prisma.document.count.mockResolvedValue(0);

            await documentService.getAllDocuments(workspaceId, {
                categoryId,
                visibility: 'PRIVATE',
            });

            expect(prisma.document.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        category: { workspaceId },
                        categoryId,
                        visibility: 'PRIVATE',
                    },
                }),
            );

            expect(prisma.document.count).toHaveBeenCalledWith({
                where: {
                    category: { workspaceId },
                    categoryId,
                    visibility: 'PRIVATE',
                },
            });
        });

        test('should return an empty list when no documents exist', async () => {
            prisma.document.findMany.mockResolvedValue([]);
            prisma.document.count.mockResolvedValue(0);

            const result = await documentService.getAllDocuments(
                workspaceId,
                {},
            );

            expect(result.documents).toEqual([]);
            expect(result.pagination.totalCount).toBe(0);
            expect(result.pagination.totalPages).toBe(0);
        });

        test('should calculate total pages correctly', async () => {
            getPagination.mockReturnValue({
                skip: 0,
                take: 10,
                page: 1,
                limit: 10,
            });

            prisma.document.findMany.mockResolvedValue([]);
            prisma.document.count.mockResolvedValue(25);

            const result = await documentService.getAllDocuments(
                workspaceId,
                {},
            );

            expect(result.pagination.totalPages).toBe(3);
        });

        test('should throw an error when database query fails', async () => {
            prisma.document.findMany.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                documentService.getAllDocuments(workspaceId, {}),
            ).rejects.toThrow('Database error');
        });
    });

    // ua: тести створення документа
    describe('createDocument', () => {
        test('should create a document when category exists', async () => {
            prisma.category.findUnique.mockResolvedValue({
                id: categoryId,
                workspaceId,
            });

            prisma.document.create.mockResolvedValue(mockDocument);

            const result = await documentService.createDocument(
                userId,
                categoryId,
                {
                    title: 'Test Document',
                    content: '<p>Test content</p>',
                },
            );

            expect(prisma.category.findUnique).toHaveBeenCalledWith({
                where: { id: categoryId },
                select: { id: true, workspaceId: true },
            });

            expect(prisma.document.create).toHaveBeenCalledWith({
                data: {
                    title: 'Test Document',
                    content: '<p>Test content</p>',
                    categoryId,
                    ownerId: userId,
                },
            });

            expect(activityService.logActivity).toHaveBeenCalledWith(
                workspaceId,
                userId,
                'CREATE_DOCUMENT',
                documentId,
                'Test Document',
            );

            expect(result).toEqual(mockDocument);
        });

        test('should throw 404 when category does not exist', async () => {
            prisma.category.findUnique.mockResolvedValue(null);

            await expect(
                documentService.createDocument(userId, categoryId, {
                    title: 'Test Document',
                }),
            ).rejects.toMatchObject({
                message: 'Category not found',
                statusCode: 404,
            });

            expect(prisma.document.create).not.toHaveBeenCalled();
            expect(activityService.logActivity).not.toHaveBeenCalled();
        });

        test('should propagate database errors', async () => {
            prisma.category.findUnique.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                documentService.createDocument(userId, categoryId, {
                    title: 'Test Document',
                }),
            ).rejects.toThrow('Database error');
        });
    });

    // ua: тести отримання файлів документа
    describe('getDocumentFiles', () => {
        test('should return document files', async () => {
            const files = [
                {
                    id: 'file-123',
                    documentId,
                    fileName: 'attachment.pdf',
                },
            ];

            prisma.document.findUnique.mockResolvedValue({
                id: documentId,
            });
            prisma.file.findMany.mockResolvedValue(files);

            const result = await documentService.getDocumentFiles(documentId);

            expect(prisma.document.findUnique).toHaveBeenCalledWith({
                where: { id: documentId },
                select: { id: true },
            });

            expect(prisma.file.findMany).toHaveBeenCalledWith({
                where: { documentId },
                orderBy: { createdAt: 'desc' },
            });

            expect(result).toEqual(files);
        });

        test('should throw 404 when document does not exist', async () => {
            prisma.document.findUnique.mockResolvedValue(null);

            await expect(
                documentService.getDocumentFiles(documentId),
            ).rejects.toMatchObject({
                message: 'Document not found',
                statusCode: 404,
            });

            expect(prisma.file.findMany).not.toHaveBeenCalled();
        });

        test('should propagate database errors', async () => {
            prisma.document.findUnique.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                documentService.getDocumentFiles(documentId),
            ).rejects.toThrow('Database error');
        });
    });

    // ua: тести отримання документа за ідентифікатором
    describe('getDocumentById', () => {
        test('should return document with owner and category', async () => {
            prisma.document.findUnique.mockResolvedValue(mockDocument);

            const result = await documentService.getDocumentById(documentId);

            expect(prisma.document.findUnique).toHaveBeenCalledWith({
                where: { id: documentId },
                include: {
                    owner: {
                        select: { id: true, name: true, email: true },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            workspaceId: true,
                        },
                    },
                },
            });

            expect(result).toEqual(mockDocument);
        });

        test('should throw 404 when document does not exist', async () => {
            prisma.document.findUnique.mockResolvedValue(null);

            await expect(
                documentService.getDocumentById(documentId),
            ).rejects.toMatchObject({
                message: 'Document not found',
                statusCode: 404,
            });
        });

        test('should propagate database errors', async () => {
            prisma.document.findUnique.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                documentService.getDocumentById(documentId),
            ).rejects.toThrow('Database error');
        });
    });

    // ua: тести оновлення документа
    describe('updateDocument', () => {
        test('should create revision and update document', async () => {
            const oldDocument = {
                ...mockDocument,
                category: { workspaceId },
            };

            const updatedDocument = {
                ...mockDocument,
                title: 'Updated Document',
                content: '<p>Updated content</p>',
            };

            prisma.document.findUnique.mockResolvedValue(oldDocument);
            prisma.revision.create.mockResolvedValue({});
            prisma.document.update.mockResolvedValue(updatedDocument);

            const result = await documentService.updateDocument(
                documentId,
                userId,
                {
                    title: 'Updated Document',
                    content: '<p>Updated content</p>',
                },
            );

            expect(prisma.document.findUnique).toHaveBeenCalledWith({
                where: { id: documentId },
                include: {
                    category: { select: { workspaceId: true } },
                },
            });

            expect(prisma.$transaction).toHaveBeenCalledTimes(1);

            expect(prisma.revision.create).toHaveBeenCalledWith({
                data: {
                    documentId,
                    content: mockDocument.content,
                    editorId: userId,
                },
            });

            expect(prisma.document.update).toHaveBeenCalledWith({
                where: { id: documentId },
                data: {
                    title: 'Updated Document',
                    content: '<p>Updated content</p>',
                },
            });

            expect(activityService.logActivity).toHaveBeenCalledWith(
                workspaceId,
                userId,
                'UPDATE_DOCUMENT',
                documentId,
                'Updated Document',
            );

            expect(result).toEqual(updatedDocument);
        });

        test('should throw 404 when document does not exist', async () => {
            prisma.document.findUnique.mockResolvedValue(null);

            await expect(
                documentService.updateDocument(documentId, userId, {
                    title: 'Updated Document',
                }),
            ).rejects.toMatchObject({
                message: 'Document not found',
                statusCode: 404,
            });

            expect(prisma.$transaction).not.toHaveBeenCalled();
        });

        test('should propagate transaction errors', async () => {
            prisma.document.findUnique.mockResolvedValue({
                ...mockDocument,
                category: { workspaceId },
            });

            prisma.revision.create.mockRejectedValue(
                new Error('Revision creation failed'),
            );

            await expect(
                documentService.updateDocument(documentId, userId, {
                    title: 'Updated Document',
                }),
            ).rejects.toThrow('Revision creation failed');

            expect(activityService.logActivity).not.toHaveBeenCalled();
        });

        test('should propagate errors when updating document', async () => {
            prisma.document.findUnique.mockResolvedValue({
                ...mockDocument,
                category: { workspaceId },
            });

            prisma.revision.create.mockResolvedValue({});
            prisma.document.update.mockRejectedValue(
                new Error('Update failed'),
            );

            await expect(
                documentService.updateDocument(documentId, userId, {
                    title: 'Updated Document',
                }),
            ).rejects.toThrow('Update failed');

            expect(activityService.logActivity).not.toHaveBeenCalled();
        });
    });

    // ua: тести отримання історії ревізій документа
    describe('getDocumentRevisions', () => {
        test('should return document revisions with editor data', async () => {
            const revisions = [
                {
                    id: 'revision-123',
                    documentId,
                    content: '<p>Old content</p>',
                    editorId: userId,
                },
            ];

            prisma.document.findUnique.mockResolvedValue(mockDocument);
            prisma.revision.findMany.mockResolvedValue(revisions);

            const result = await documentService.getDocumentRevisions(
                documentId,
            );

            expect(prisma.document.findUnique).toHaveBeenCalledWith({
                where: { id: documentId },
            });

            expect(prisma.revision.findMany).toHaveBeenCalledWith({
                where: { documentId },
                include: {
                    editor: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
            });

            expect(result).toEqual(revisions);
        });

        test('should return an empty array when no revisions exist', async () => {
            prisma.document.findUnique.mockResolvedValue(mockDocument);
            prisma.revision.findMany.mockResolvedValue([]);

            const result = await documentService.getDocumentRevisions(
                documentId,
            );

            expect(result).toEqual([]);
        });

        test('should throw 404 when document does not exist', async () => {
            prisma.document.findUnique.mockResolvedValue(null);

            await expect(
                documentService.getDocumentRevisions(documentId),
            ).rejects.toMatchObject({
                message: 'Document not found',
                statusCode: 404,
            });

            expect(prisma.revision.findMany).not.toHaveBeenCalled();
        });

        test('should propagate database errors', async () => {
            prisma.document.findUnique.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                documentService.getDocumentRevisions(documentId),
            ).rejects.toThrow('Database error');
        });
    });

    // ua: тести видалення документа
    describe('deleteDocument', () => {
        test('should delete document and log activity', async () => {
            const document = {
                ...mockDocument,
                category: { workspaceId },
            };

            prisma.document.findUnique.mockResolvedValue(document);
            prisma.document.delete.mockResolvedValue(document);

            const result = await documentService.deleteDocument(documentId);

            expect(prisma.document.findUnique).toHaveBeenCalledWith({
                where: { id: documentId },
                include: {
                    category: { select: { workspaceId: true } },
                },
            });

            expect(prisma.document.delete).toHaveBeenCalledWith({
                where: { id: documentId },
            });

            expect(activityService.logActivity).toHaveBeenCalledWith(
                workspaceId,
                userId,
                'DELETE_DOCUMENT',
                documentId,
                'Test Document',
            );

            expect(result).toEqual(document);
        });

        test('should throw 404 when document does not exist', async () => {
            prisma.document.findUnique.mockResolvedValue(null);

            await expect(
                documentService.deleteDocument(documentId),
            ).rejects.toMatchObject({
                message: 'Document not found',
                statusCode: 404,
            });

            expect(prisma.document.delete).not.toHaveBeenCalled();
            expect(activityService.logActivity).not.toHaveBeenCalled();
        });

        test('should propagate database errors', async () => {
            prisma.document.findUnique.mockResolvedValue({
                ...mockDocument,
                category: { workspaceId },
            });

            prisma.document.delete.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                documentService.deleteDocument(documentId),
            ).rejects.toThrow('Database error');

            expect(activityService.logActivity).not.toHaveBeenCalled();
        });
    });
});
