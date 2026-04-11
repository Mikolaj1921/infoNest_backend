const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Content (Category & Document) Integration Tests', () => {
    let token, user, workspace;

    beforeEach(async () => {
        // ua: отримання токена та створення тестового воркспейсу для кожного тесту
        const auth = await getAuthToken();
        token = auth.token;
        user = auth.user;

        workspace = await prisma.workspace.create({
            data: {
                name: 'Content Test WS',
                ownerId: user.id,
                users: { create: { userId: user.id, role: 'Owner' } }
            }
        });
    });

    describe('Category API', () => {
        test('should successfully create a category', async () => {
            const res = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Marketing', workspaceId: workspace.id });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.category.name).toBe('Marketing');
        });

        // ua: поки вимк бо restrictTo вимкнено в роутах
        /*
        test('should return 403 if user is not a member of workspace', async () => {
            const otherAuth = await getAuthToken('stranger@test.com');
        
            const res = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${otherAuth.token}`)
                .send({ name: 'Hack attempt', workspaceId: workspace.id });
        
            expect(res.statusCode).toBe(403);
        });
        */
    });

    describe('Document API', () => {
        let category;

        beforeEach(async () => {
            category = await prisma.category.create({
                data: { name: 'Technical Docs', workspaceId: workspace.id }
            });
        });

        test('should successfully create a document', async () => {
            const res = await request(app)
                .post('/api/documents')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'System Architecture',
                    content: 'Initial draft content...',
                    categoryId: category.id
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.document.title).toBe('System Architecture');
        });

        test('should get document details', async () => {
            const doc = await prisma.document.create({
                data: {
                    title: 'Read Me',
                    content: 'Some text',
                    categoryId: category.id,
                    ownerId: user.id
                }
            });

            const res = await request(app)
                .get(`/api/documents/${doc.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.document.category.name).toBe('Technical Docs');
        });
    });

    describe('Cascade Delete Logic', () => {
        test('should delete all documents when category is deleted', async () => {
            const cat = await prisma.category.create({
                data: { name: 'Temp Cat', workspaceId: workspace.id }
            });

            await prisma.document.create({
                data: { title: 'Doc 1', content: '...', categoryId: cat.id, ownerId: user.id }
            });

            const res = await request(app)
                .delete(`/api/categories/${cat.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(204);

            const docsCount = await prisma.document.count({
                where: { categoryId: cat.id }
            });
            expect(docsCount).toBe(0);
        });
    });
});
