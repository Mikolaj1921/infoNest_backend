
const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Workspace Integration Tests', () => {
    let token;
    let user;

    const workspaceData = {
        name: 'Development WS',
        visibility: 'PRIVATE',
    };

    // ua: отримання токена авторизації перед кожним тестом
    beforeEach(async () => {
        const auth = await getAuthToken();
        token = auth.token;
        user = auth.user;
    });

    // ua: допоміжна функція для створення воркспейсу через API
    const createWorkspace = async (authToken = token, data = workspaceData) => {
        return request(app)
            .post('/api/workspaces')
            .set('Authorization', `Bearer ${authToken}`)
            .send(data);
    };

    describe('POST /api/workspaces', () => {
        test('should successfully create a new workspace', async () => {
            const response = await createWorkspace();

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.workspace).toMatchObject({
                name: workspaceData.name,
                visibility: workspaceData.visibility,
                ownerId: user.id,
            });
        });

        test('should automatically assign Owner role to workspace creator', async () => {
            const response = await createWorkspace();
            const workspaceId = response.body.data.workspace.id;

            const membership = await prisma.userWorkspace.findFirst({
                where: {
                    userId: user.id,
                    workspaceId,
                },
            });

            expect(membership).toBeTruthy();
            expect(membership.role).toBe('Owner');
        });

        test('should return 400 when workspace data is invalid', async () => {
            const response = await createWorkspace(token, {
                name: '',
                visibility: 'INVALID',
            });

            expect(response.status).toBe(400);
        });

        test('should return 401 when user is not authenticated', async () => {
            const response = await request(app)
                .post('/api/workspaces')
                .send(workspaceData);

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/workspaces', () => {
        test('should return all workspaces belonging to current user', async () => {
            await createWorkspace(token, {
                name: 'First Workspace',
                visibility: 'PRIVATE',
            });

            await createWorkspace(token, {
                name: 'Second Workspace',
                visibility: 'PUBLIC',
            });

            const response = await request(app)
                .get('/api/workspaces')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.workspaces).toHaveLength(2);

            expect(
                response.body.data.workspaces.map((workspace) => workspace.name),
            ).toEqual(expect.arrayContaining([
                'First Workspace',
                'Second Workspace',
            ]));
        });

        test('should return an empty list when user has no workspaces', async () => {
            const response = await request(app)
                .get('/api/workspaces')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.workspaces).toEqual([]);
            expect(response.body.data.pagination).toMatchObject({
                page: 1,
                limit: 10,
                totalCount: 0,
                totalPages: 0,
            });
        });

        test('should return correct pagination metadata', async () => {
            await createWorkspace(token, {
                name: 'Workspace 1',
                visibility: 'PRIVATE',
            });

            await createWorkspace(token, {
                name: 'Workspace 2',
                visibility: 'PRIVATE',
            });

            await createWorkspace(token, {
                name: 'Workspace 3',
                visibility: 'PRIVATE',
            });

            const response = await request(app)
                .get('/api/workspaces?page=1&limit=2')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.workspaces).toHaveLength(2);
            expect(response.body.data.pagination).toMatchObject({
                page: 1,
                limit: 2,
                totalCount: 3,
                totalPages: 2,
            });
        });

        test('should not return workspaces belonging to other users', async () => {
            await createWorkspace(token, {
                name: 'My Workspace',
                visibility: 'PRIVATE',
            });

            const otherAuth = await getAuthToken('other@test.com');

            await createWorkspace(otherAuth.token, {
                name: 'Other User Workspace',
                visibility: 'PUBLIC',
            });

            const response = await request(app)
                .get('/api/workspaces')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.workspaces).toHaveLength(1);
            expect(response.body.data.workspaces[0].name).toBe('My Workspace');
        });

        test('should return 401 when user is not authenticated', async () => {
            const response = await request(app)
                .get('/api/workspaces');

            expect(response.status).toBe(401);
        });
    });

    describe('PATCH /api/workspaces/:id', () => {
        test('should successfully update workspace when current user is the owner', async () => {
            const created = await createWorkspace();
            const workspaceId = created.body.data.workspace.id;

            const response = await request(app)
                .patch(`/api/workspaces/${workspaceId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Workspace',
                    visibility: 'PUBLIC',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.workspace).toMatchObject({
                id: workspaceId,
                name: 'Updated Workspace',
                visibility: 'PUBLIC',
                ownerId: user.id,
            });
        });

        test('should return 403 when another user tries to update workspace', async () => {
            const created = await createWorkspace();
            const workspaceId = created.body.data.workspace.id;

            const otherAuth = await getAuthToken('other@test.com');

            const response = await request(app)
                .patch(`/api/workspaces/${workspaceId}`)
                .set('Authorization', `Bearer ${otherAuth.token}`)
                .send({
                    name: 'Unauthorized Update',
                });

            expect(response.status).toBe(403);
        });

        test('should return 403 when workspace does not exist', async () => {
            const response = await request(app)
                .patch('/api/workspaces/clxxxxxxxxxxxxxxxxxxxxxxxx')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Workspace' });

            expect(response.status).toBe(403);
        });

        test('should return 400 when update data is invalid', async () => {
            const created = await createWorkspace();
            const workspaceId = created.body.data.workspace.id;

            const response = await request(app)
                .patch(`/api/workspaces/${workspaceId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    visibility: 'INVALID',
                });

            expect(response.status).toBe(400);
        });

        test('should return 401 when user is not authenticated', async () => {
            const created = await createWorkspace();
            const workspaceId = created.body.data.workspace.id;

            const response = await request(app)
                .patch(`/api/workspaces/${workspaceId}`)
                .send({
                    name: 'Updated Workspace',
                });

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/workspaces/:id', () => {
        test('should successfully delete workspace when current user is the owner', async () => {
            const created = await createWorkspace();
            const workspaceId = created.body.data.workspace.id;

            const response = await request(app)
                .delete(`/api/workspaces/${workspaceId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(204);

            const deletedWorkspace = await prisma.workspace.findUnique({
                where: { id: workspaceId },
            });

            expect(deletedWorkspace).toBeNull();
        });

        test('should return 403 when another user tries to delete workspace', async () => {
            const created = await createWorkspace();
            const workspaceId = created.body.data.workspace.id;

            const otherAuth = await getAuthToken('other@test.com');

            const response = await request(app)
                .delete(`/api/workspaces/${workspaceId}`)
                .set('Authorization', `Bearer ${otherAuth.token}`);

            expect(response.status).toBe(403);

            const workspace = await prisma.workspace.findUnique({
                where: { id: workspaceId },
            });

            expect(workspace).not.toBeNull();
        });

        test('should return 403 when workspace does not exist', async () => {
            const response = await request(app)
                .delete('/api/workspaces/non-existent-workspace')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
        });

        test('should return 401 when user is not authenticated', async () => {
            const created = await createWorkspace();
            const workspaceId = created.body.data.workspace.id;

            const response = await request(app)
                .delete(`/api/workspaces/${workspaceId}`);

            expect(response.status).toBe(401);
        });
    });
});
