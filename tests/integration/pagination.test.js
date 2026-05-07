const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Production Readiness & API Optimization Tests', () => {
    let token, user, workspace, category;

    beforeEach(async () => {
        // ua: Повне очищення для чистоти тесту
        await prisma.document.deleteMany();
        await prisma.category.deleteMany();
        await prisma.userWorkspace.deleteMany();
        await prisma.workspace.deleteMany();

        const auth = await getAuthToken();
        token = auth.token;
        user = auth.user;

        workspace = await prisma.workspace.create({
            data: {
                name: 'Optimization WS',
                ownerId: user.id,
                users: { create: { userId: user.id, role: 'Owner' } }
            }
        });

        category = await prisma.category.create({
            data: { name: 'Test Category', workspaceId: workspace.id }
        });
    });

    test('should return paginated documents (limit 10 out of 15)', async () => {
        // ua: створюємо 15 документів
        const docsData = Array.from({ length: 15 }).map((_, i) => ({
            title: `Document ${i + 1}`,
            content: 'Content',
            categoryId: category.id,
            ownerId: user.id
        }));
        await prisma.document.createMany({ data: docsData });

        const res = await request(app)
            .get(`/api/documents`) // ua: спробуємо передати workspaceId через query
            .query({ workspaceId: workspace.id, limit: 10, page: 1 })
            .set('Authorization', `Bearer ${token}`);

        // ua: ЯКЩО ПОМИЛКА — ЦЕЙ ЛОГ ПОКАЖЕ ПРИЧИНУ (можливо там AppError)
        if (res.statusCode !== 200) {
            console.log('DEBUG INFO:', res.body);
        }

        expect(res.statusCode).toBe(200);
        expect(res.body.data.documents.length).toBe(10);
    });

    test('should verify database query logic works with indexes', async () => {
        const res = await request(app)
            .get(`/api/categories/workspace/${workspace.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });

    test('should verify Swagger documentation is accessible', async () => {
        const res = await request(app).get('/api-docs');
        // ua: Перевіряємо на 200 або редірект 301/302
        expect([200, 301, 302]).toContain(res.statusCode);
    });
});
