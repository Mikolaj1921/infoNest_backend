
const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Category Integration Tests', () => {
    let token;
    let user;
    let workspace;
    let category;

    // ua: підготовка тестового середовища
    beforeEach(async () => {
        const auth = await getAuthToken();
        token = auth.token;
        user = auth.user;

        workspace = await prisma.workspace.create({
            data: {
                name: 'Category Test WS',
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
    });

    // ua: створення категорії
    describe('POST /api/categories', () => {
        test('should successfully create a category', async () => {
            const res = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Design Docs',
                    workspaceId: workspace.id,
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.category.name).toBe('Design Docs');
            expect(res.body.data.category.workspaceId).toBe(workspace.id);

            const createdCategory = await prisma.category.findUnique({
                where: { id: res.body.data.category.id },
            });

            expect(createdCategory).not.toBeNull();
        });

        test('should return 400 if category name is too short', async () => {
            const res = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'AB',
                    workspaceId: workspace.id,
                });

            expect(res.statusCode).toBe(400);
        });

        test('should return 403 if workspace ID is invalid', async () => {
            const res = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Design Docs',
                    workspaceId: 'invalid-id',
                });

            expect(res.statusCode).toBe(403);
        });

        test('should return 403 if workspace does not exist', async () => {
            const res = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Design Docs',
                    workspaceId: 'cmmmmm123456789012345678',
                });

            expect(res.statusCode).toBe(403);
        });

        test('should return 401 if user is not authenticated', async () => {
            const res = await request(app)
                .post('/api/categories')
                .send({
                    name: 'Design Docs',
                    workspaceId: workspace.id,
                });

            expect(res.statusCode).toBe(401);
        });
    });

    // ua: отримання категорій воркспейсу
    describe('GET /api/categories/workspace/:id', () => {
        test('should successfully get workspace categories', async () => {
            const res = await request(app)
                .get(`/api/categories/workspace/${workspace.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.categories).toHaveLength(1);
            expect(res.body.data.categories[0].name).toBe('Technical Docs');
            expect(res.body.data.categories[0]._count.documents).toBe(0);
        });

        test('should return an empty list if workspace has no categories', async () => {
            await prisma.category.delete({
                where: { id: category.id },
            });

            const res = await request(app)
                .get(`/api/categories/workspace/${workspace.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.categories).toEqual([]);
            expect(res.body.data.pagination.totalCount).toBe(0);
        });

        test('should return 404 if workspace does not exist', async () => {
            const res = await request(app)
                .get('/api/categories/workspace/cmmmmm123456789012345678')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
        });

        test('should return 401 if user is not authenticated', async () => {
            const res = await request(app)
                .get(`/api/categories/workspace/${workspace.id}`);

            expect(res.statusCode).toBe(401);
        });
    });

    // ua: оновлення категорії
    describe('PATCH /api/categories/:id', () => {
        test('should successfully update category name', async () => {
            const res = await request(app)
                .patch(`/api/categories/${category.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Category' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.category.name).toBe('Updated Category');

            const updatedCategory = await prisma.category.findUnique({
                where: { id: category.id },
            });

            expect(updatedCategory.name).toBe('Updated Category');
        });

        test('should return 404 if category does not exist', async () => {
            const res = await request(app)
                .patch('/api/categories/cmmmmm123456789012345678')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Category' });

            expect(res.statusCode).toBe(404);
        });

        test('should return 401 if user is not authenticated', async () => {
            const res = await request(app)
                .patch(`/api/categories/${category.id}`)
                .send({ name: 'Updated Category' });

            expect(res.statusCode).toBe(401);
        });
    });

    // ua: видалення категорії
    describe('DELETE /api/categories/:id', () => {
        test('should successfully delete a category', async () => {
            const res = await request(app)
                .delete(`/api/categories/${category.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(204);

            const deletedCategory = await prisma.category.findUnique({
                where: { id: category.id },
            });

            expect(deletedCategory).toBeNull();
        });

        test('should return 404 if category does not exist', async () => {
            const res = await request(app)
                .delete('/api/categories/cmmmmm123456789012345678')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
        });

        test('should return 401 if user is not authenticated', async () => {
            const res = await request(app)
                .delete(`/api/categories/${category.id}`);

            expect(res.statusCode).toBe(401);
        });
    });
});
