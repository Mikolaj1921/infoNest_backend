const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Membership & RBAC Integration Tests', () => {
    let ownerToken, ownerUser, memberUser, workspace;

    beforeEach(async () => {
        // ua: налаштування власника воркспейсу
        const ownerAuth = await getAuthToken('owner@test.com');
        ownerToken = ownerAuth.token;
        ownerUser = ownerAuth.user;

        // ua: налаштування іншого користувача для тестів
        const memberAuth = await getAuthToken('guest@test.com');
        memberUser = memberAuth.user;

        // ua: створення тестового воркспейсу
        workspace = await prisma.workspace.create({
            data: {
                name: 'Team Space',
                ownerId: ownerUser.id,
                users: { create: { userId: ownerUser.id, role: 'Owner' } }
            }
        });
    });

    // ua: тести додавання учасників
    describe('POST /api/workspaces/:id/members', () => {
        test('should allow Owner to add a new member with specific role', async () => {
            const res = await request(app)
                .post(`/api/workspaces/${workspace.id}/members`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ email: memberUser.email, role: 'Editor' });

            expect(res.statusCode).toBe(201);
            // ua: шлях до email через об'єкт membership так як згідно з контролером
            expect(res.body.data.membership.user.email).toBe(memberUser.email);

            // ua: перевірка чи реально зявився запис у бд
            const membership = await prisma.userWorkspace.findUnique({
                where: { userId_workspaceId: { userId: memberUser.id, workspaceId: workspace.id } }
            });
            expect(membership.role).toBe('Editor');
        });

        test('should return 400 if user is already a member', async () => {
            // ua: додавання учасника заздалегідь через Prisma
            await prisma.userWorkspace.create({
                data: { userId: memberUser.id, workspaceId: workspace.id, role: 'Viewer' }
            });

            const res = await request(app)
                .post(`/api/workspaces/${workspace.id}/members`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ email: memberUser.email, role: 'Admin' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('already a member');
        });
    });

    // ua: тести оновлення ролей учасників
    describe('PATCH /api/workspaces/:id/members/:userId', () => {
        test('should allow Admin/Owner to update member role', async () => {
            // ua: додавання учасника
            await prisma.userWorkspace.create({
                data: { userId: memberUser.id, workspaceId: workspace.id, role: 'Viewer' }
            });

            const res = await request(app)
                .patch(`/api/workspaces/${workspace.id}/members/${memberUser.id}`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ role: 'Admin' });

            expect(res.statusCode).toBe(200);
            // ua: в шлях до ролі згідно з контролером через обєкт membership
            expect(res.body.data.membership.role).toBe('Admin');

            const updatedMember = await prisma.userWorkspace.findUnique({
                where: { userId_workspaceId: { userId: memberUser.id, workspaceId: workspace.id } }
            });
            expect(updatedMember.role).toBe('Admin');
        });
    });

    // ua: тести видалення учасників
    describe('DELETE /api/workspaces/:id/members/:userId', () => {
        test('should successfully remove a member by Owner', async () => {
            // ua: додавання учасника
            await prisma.userWorkspace.create({
                data: { userId: memberUser.id, workspaceId: workspace.id, role: 'Editor' }
            });

            const res = await request(app)
                .delete(`/api/workspaces/${workspace.id}/members/${memberUser.id}`)
                .set('Authorization', `Bearer ${ownerToken}`);

            // ua: 204 згідно з твоїм контролером
            expect(res.statusCode).toBe(204);

            const membership = await prisma.userWorkspace.findUnique({
                where: { userId_workspaceId: { userId: memberUser.id, workspaceId: workspace.id } }
            });
            expect(membership).toBeNull();
        });

        test('should return 400 when trying to remove the Owner', async () => {
            const res = await request(app)
                .delete(`/api/workspaces/${workspace.id}/members/${ownerUser.id}`)
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Cannot remove the Owner');
        });

        test('should return 403 if a Member tries to remove someone (RBAC check)', async () => {
            // ua: створюення токена звичайного юзера 
            const guestAuth = await getAuthToken('simple@test.com');
            await prisma.userWorkspace.create({
                data: { userId: guestAuth.user.id, workspaceId: workspace.id, role: 'Viewer' }
            });

            const res = await request(app)
                .delete(`/api/workspaces/${workspace.id}/members/${ownerUser.id}`)
                .set('Authorization', `Bearer ${guestAuth.token}`);

            // ua: 403, бо має спрацювати restrictTo('Owner', 'Admin')
            expect(res.statusCode).toBe(403);
        });
    });
});
