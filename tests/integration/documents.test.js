
const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Document Integration Tests', () => {
    let token;
    let user;
    let workspace;
    let category;
    let document;

    // ua: підготовка тестового середовища
    beforeEach(async () => {
        const auth = await getAuthToken();
        token = auth.token;
        user = auth.user;

        workspace = await prisma.workspace.create({
            data: {
                name: 'Document Test WS',
                ownerId: user.id,
                users: {
                    create: {
                        userId: user.id,
                        role: 'Owner',
                    },
                },
            },
        });

        category = await prisma.category.create({
            data: {
                name: 'Technical Docs',
                workspaceId: workspace.id,
            },
        });

        document = await prisma.document.create({
            data: {
                title: 'Initial Title',
                content: 'Original Content',
                categoryId: category.id,
                ownerId: user.id,
            },
        });
    });

    // ua: створення документа
    describe('POST /api/documents', () => {
        test('should successfully create a document', async () => {
            const res = await request(app)
                .post('/api/documents')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'System Architecture',
                    content: 'Initial draft content...',
                    categoryId: category.id,
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.document.title).toBe('System Architecture');
            expect(res.body.data.document.content).toBe('Initial draft content...');
            expect(res.body.data.document.categoryId).toBe(category.id);
            expect(res.body.data.document.ownerId).toBe(user.id);
        });
    });

    // ua: отримання документа
    describe('GET /api/documents/:id', () => {
        test('should successfully get document details', async () => {
            const res = await request(app)
                .get(`/api/documents/${document.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.document.title).toBe('Initial Title');
            expect(res.body.data.document.content).toBe('Original Content');
            expect(res.body.data.document.category.name).toBe('Technical Docs');
            expect(res.body.data.document.owner.id).toBe(user.id);
        });

        test('should return 404 if document does not exist', async () => {
            const res = await request(app)
                .get('/api/documents/cmmmmm123456789012345678')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
        });
    });

    // ua: оновлення документа та створення ревізії
    describe('PATCH /api/documents/:id', () => {
        test('should successfully update document content', async () => {
            const newContent = 'Updated Content';

            const res = await request(app)
                .patch(`/api/documents/${document.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: newContent });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.document.content).toBe(newContent);
        });

        test('should automatically create a revision with old content after update', async () => {
            const newContent = 'Updated Content';

            const updateRes = await request(app)
                .patch(`/api/documents/${document.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: newContent });

            expect(updateRes.statusCode).toBe(200);
            expect(updateRes.body.data.document.content).toBe(newContent);

            // ua: перевірка створеної ревізії
            const revision = await prisma.revision.findFirst({
                where: { documentId: document.id },
            });

            expect(revision).not.toBeNull();
            expect(revision.content).toBe('Original Content');
            expect(revision.editorId).toBe(user.id);
        });
    });

    // ua: отримання історії змін документа
    describe('GET /api/documents/:id/revisions', () => {
        test('should successfully get document revisions', async () => {
            await request(app)
                .patch(`/api/documents/${document.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Updated Content' });

            const res = await request(app)
                .get(`/api/documents/${document.id}/revisions`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.results).toBe(1);
            expect(res.body.data.revisions[0].content).toBe('Original Content');
            expect(res.body.data.revisions[0].editorId).toBe(user.id);
        });
    });

    // ua: отримання прикріплених до документа файлів
    describe('GET /api/documents/:id/files', () => {
        test('should successfully get document files', async () => {
            const res = await request(app)
                .get(`/api/documents/${document.id}/files`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });
    });

    // ua: видалення документа
    describe('DELETE /api/documents/:id', () => {
        test('should successfully delete a document', async () => {
            const res = await request(app)
                .delete(`/api/documents/${document.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(204);

            const deletedDocument = await prisma.document.findUnique({
                where: { id: document.id },
            });

            expect(deletedDocument).toBeNull();
        });
    });
});
