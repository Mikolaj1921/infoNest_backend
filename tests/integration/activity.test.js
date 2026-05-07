const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Activity Feed Integration Tests', () => {
    let token, user, workspace, category;

    beforeEach(async () => {
        const auth = await getAuthToken();
        token = auth.token;
        user = auth.user;

        workspace = await prisma.workspace.create({
            data: {
                name: 'Activity Monitoring WS',
                ownerId: user.id,
                users: { create: { userId: user.id, role: 'Owner' } },
            },
        });

        category = await prisma.category.create({
            data: { name: 'System Logs', workspaceId: workspace.id },
        });
    });

    test('should log "CREATE_DOCUMENT" action and retrieve it via workspace activity route', async () => {
        const docRes = await request(app)
            .post('/api/documents')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Audit Document',
                content: 'This action should be logged',
                categoryId: category.id,
            });

        expect(docRes.statusCode).toBe(201);

        await new Promise((resolve) => setTimeout(resolve, 500));

        const activityRes = await request(app)
            .get(`/api/workspaces/${workspace.id}/activity`)
            .set('Authorization', `Bearer ${token}`);

        expect(activityRes.statusCode).toBe(200);

        // ua:  перевіряємо довжину масиву всередині data.activity
        expect(activityRes.body.data.activity.length).toBeGreaterThan(0);
        // ua: перевіряємо, що пагінація також приходить
        expect(activityRes.body.data.pagination.totalCount).toBeGreaterThan(0);

        const log = activityRes.body.data.activity.find(
            (a) => a.action === 'CREATE_DOCUMENT'
        );

        expect(log).toBeDefined();
        expect(log.entityName).toBe('Audit Document');
        expect(log.user.name).toBe(user.name);
    });

    test('should return 403 when user is not a member of the workspace', async () => {
        const strangerAuth = await getAuthToken('stranger@test.com');

        const res = await request(app)
            .get(`/api/workspaces/${workspace.id}/activity`)
            .set('Authorization', `Bearer ${strangerAuth.token}`);

        expect(res.statusCode).toBe(403);
    });
});
