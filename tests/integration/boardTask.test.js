// ai tests

const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Kanban Tasks Integration Tests', () => {
    let token, user, workspace, column;
    const TEST_EMAIL = 'task.test@example.com';

    beforeEach(async () => {
        // ua: підготовка користувача та сесії
        const auth = await getAuthToken(TEST_EMAIL);
        token = auth.token;
        user = auth.user;

        // ua: створення чистого воркспейсу
        workspace = await prisma.workspace.create({
            data: {
                name: 'Test Tasks Project',
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

        // ua: створення базової колонки для тасок
        column = await prisma.taskCategory.create({
            data: { name: 'Sprint Board', workspaceId: workspace.id, position: 0 }
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/board-tasks', () => {
        test('should successfully create a board task card inside a column', async () => {
            // ua: створення картки задачі канбан із передачею контексту воркспейсу
            const res = await request(app)
                .post('/api/board-tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Implement Zod Validation',
                    description: 'Cover schemas for tasks',
                    columnId: column.id,
                    workspaceId: workspace.id,
                    priority: 'HIGH'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.task.title).toBe('Implement Zod Validation');
        });
    });

    describe('PATCH /api/board-tasks/reorder', () => {
        test('should successfully update task card positions array', async () => {
            const task = await prisma.boardTask.create({
                data: {
                    title: 'Run Integration Tests',
                    columnId: column.id,
                    ownerId: user.id,
                    position: 0,
                    priority: 'MEDIUM'
                }
            });

            // ua: перевірка зміни позицій при drag and drop
            const res = await request(app)
                .patch('/api/board-tasks/reorder')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    workspaceId: workspace.id,
                    tasks: [
                        {
                            id: task.id,
                            position: 1,
                            columnId: column.id,
                        },
                    ],
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('POST /api/board-tasks/:id/attachments', () => {
        test('should link an existing workspace document to a task card', async () => {
            const docCategory = await prisma.category.create({
                data: { name: 'Main Docs Folder', workspaceId: workspace.id }
            });

            const doc = await prisma.document.create({
                data: {
                    title: 'API Spec Doc',
                    content: '<p>Schema docs</p>',
                    categoryId: docCategory.id,
                    ownerId: user.id
                }
            });

            const task = await prisma.boardTask.create({
                data: {
                    title: 'Task for Linking',
                    columnId: column.id,
                    ownerId: user.id,
                    position: 0,
                    priority: 'LOW'
                }
            });

            // ua: прикріплення документа системи до таски
            const res = await request(app)
                .post(`/api/board-tasks/${task.id}/attachments`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    documentId: doc.id,
                    workspaceId: workspace.id
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.task.documents).toBeDefined();
        });
    });
});
