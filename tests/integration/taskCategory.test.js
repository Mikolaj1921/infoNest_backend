// ai tests

const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Kanban Columns Integration Tests', () => {
    let token, user, workspace;
    const TEST_EMAIL = 'column.test@example.com';

    beforeEach(async () => {
        // ua: підготовка користувача та сесії
        const auth = await getAuthToken(TEST_EMAIL);
        token = auth.token;
        user = auth.user;

        // ua: створення чистого воркспейсу
        workspace = await prisma.workspace.create({
            data: {
                name: 'Test Columns Project',
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

    describe('POST /api/task-categories', () => {
        test('should successfully create a task column category', async () => {
            // ua: створення нової колонки тасок
            const res = await request(app)
                .post('/api/task-categories')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Backend Epic',
                    workspaceId: workspace.id,
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.category).toBeDefined();
            expect(res.body.data.category.name).toBe('Backend Epic');
        });
    });

    describe('GET /api/task-categories/workspace/:workspaceId', () => {
        test('should successfully retrieve all workspace task columns', async () => {
            // ua: наповнення бази тестовою колонкою
            await prisma.taskCategory.create({
                data: {
                    name: 'Frontend Epic',
                    workspaceId: workspace.id,
                    position: 0
                }
            });

            // ua: отримання списку колонок воркспейсу
            const res = await request(app)
                .get(`/api/task-categories/workspace/${workspace.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.categories)).toBe(true);
        });
    });
});
