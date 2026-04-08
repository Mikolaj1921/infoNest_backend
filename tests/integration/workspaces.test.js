const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Workspace Integration Tests', () => {
    let token, user;

    beforeEach(async () => {
        // ua: отримання авторизованого користувача перед кожним тестом
        const auth = await getAuthToken();
        token = auth.token;
        user = auth.user;
    });

    // ua: тести для створення воркспейсу
    describe('POST /api/workspaces', () => {
        test('should successfully create workspace and assign Owner role', async () => {
            const res = await request(app)
                .post('/api/workspaces')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Development WS', visibility: 'PRIVATE' });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.workspace.name).toBe('Development WS');

            // ua: перевірка чи створився запис у UserWorkspace з роллю овнера
            const membership = await prisma.userWorkspace.findUnique({
                where: { userId_workspaceId: { userId: user.id, workspaceId: res.body.data.workspace.id } }
            });
            expect(membership.role).toBe('Owner');
        });
    });

    // ua: тести для апдейту воркспейсу
    describe('PATCH /api/workspaces/:id', () => {
        test('should allow Owner to update workspace details', async () => {
            // ua: створення воркспейсу через Prisma
            const ws = await prisma.workspace.create({
                data: {
                    name: 'Old Name',
                    ownerId: user.id,
                    users: { create: { userId: user.id, role: 'Owner' } }
                }
            });

            const res = await request(app)
                .patch(`/api/workspaces/${ws.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'New Shiny Name' });

            expect(res.statusCode).toBe(200);

            expect(res.body.data.workspace.name).toBe('New Shiny Name');
        });

        test('should return 403 if non-owner tries to update', async () => {
            const otherAuth = await getAuthToken('other@test.com');
            const otherWs = await prisma.workspace.create({
                data: { name: 'Secret WS', ownerId: otherAuth.user.id }
            });

            const res = await request(app)
                .patch(`/api/workspaces/${otherWs.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Hacked Name' });

            expect(res.statusCode).toBe(403);
        });
    });

    // ua: тести для видалення воркспейсу
    describe('DELETE /api/workspaces/:id', () => {
        test('should successfully delete workspace by Owner', async () => {
            const ws = await prisma.workspace.create({
                data: {
                    name: 'To delete',
                    ownerId: user.id,
                    users: { create: { userId: user.id, role: 'Owner' } }
                }
            });

            const res = await request(app)
                .delete(`/api/workspaces/${ws.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(204);

            const wsInDb = await prisma.workspace.findUnique({ where: { id: ws.id } });
            expect(wsInDb).toBeNull();
        });
    });
});
