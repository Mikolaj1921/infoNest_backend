const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Notifications System Integration Tests', () => {
    let token, user, workspace, secondUser, tokenOfReceiver;

    beforeEach(async () => {
        // ua: очищення бази та підготовка токенів
        const auth = await getAuthToken();
        token = auth.token;
        user = auth.user;

        // create workspace
        workspace = await prisma.workspace.create({
            data: {
                name: 'Notification Testing WS',
                ownerId: user.id,
                users: { create: { userId: user.id, role: 'Owner' } }
            }
        });

        // create second user for receiving notifications
        const secondAuth = await getAuthToken('receiver@test.com');
        secondUser = secondAuth.user;
        tokenOfReceiver = secondAuth.token;
    });

    test('should create an in-app notification when a user is added to workspace', async () => {
        // Додання мембера через API (щоб тригернути створення сповіщення)
        const res = await request(app)
            .post(`/api/workspaces/${workspace.id}/members`)
            .set('Authorization', `Bearer ${token}`)
            .send({ email: secondUser.email, role: 'Editor' });

        expect(res.statusCode).toBe(201);

        // ua: мікро-пауза щоб асинх сповіщення встигло записатися
        await new Promise((resolve) => setTimeout(resolve, 100));

        // записання сповіщення від імені отримувача
        const notifyRes = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${tokenOfReceiver}`);

        expect(notifyRes.statusCode).toBe(200);
        expect(notifyRes.body.results).toBe(1);

        const notification = notifyRes.body.data.notifications[0];
        expect(notification.type).toBe('INVITE');
        expect(notification.isRead).toBe(false);
        expect(notification.title).toBe('New Workspace Invitation');
    });

    test('should mark notification as read', async () => {
        // ua: створення сповіщення вручну для тесту читання
        const notification = await prisma.notification.create({
            data: {
                userId: user.id,
                title: 'Test Title',
                message: 'Test Message',
                type: 'SYSTEM'
            }
        });

        const res = await request(app)
            .patch(`/api/notifications/${notification.id}/read`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Notification marked as read');

        // ua:пчек в базі
        const updatedNotification = await prisma.notification.findUnique({
            where: { id: notification.id }
        });
        expect(updatedNotification.isRead).toBe(true);
    });
});
