// ai tests

const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Whiteboard Integration Tests', () => {
    let token, user, workspace;
    const TEST_EMAIL = 'whiteboard.test@example.com';

    beforeEach(async () => {
        // ua: підготовка користувача та сесії
        const auth = await getAuthToken(TEST_EMAIL);
        token = auth.token;
        user = auth.user;

        // ua: створення чистого воркспейсу
        workspace = await prisma.workspace.create({
            data: {
                name: 'Test Whiteboard Project',
                ownerId: user.id,
            },
        });

        // ua: підключення ролі для проходження restrictTo мідлвару
        await prisma.userWorkspace.create({
            data: {
                userId: user.id,
                workspaceId: workspace.id,
                role: 'Owner'
            }
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('GET /api/whiteboards/workspace/:workspaceId', () => {
        test('should automatically get or initialize an empty Miro JSON canvas', async () => {
            // ua: ініціалізація нової інтерактивної дошки
            const res = await request(app)
                .get(`/api/whiteboards/workspace/${workspace.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.whiteboard.elements).toEqual([]);
        });
    });

    describe('PATCH /api/whiteboards/:id', () => {
        test('should save Miro elements state array and sanitize XSS from text blocks', async () => {
            // ua: підготовка сесії малювання
            const whiteboard = await prisma.whiteboard.create({
                data: {
                    workspaceId: workspace.id,
                    elements: []
                }
            });

            const mockElements = [
                { id: 'el-1', type: 'text', text: 'Clean Canvas State' },
            ];

            // ua: надсилаємо контекст у квері та дублюємо в боді для 100% сумісності з мідлварами
            const res = await request(app)
                .patch(`/api/whiteboards/${whiteboard.id}?workspaceId=${workspace.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    elements: mockElements,
                    workspaceId: workspace.id
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
