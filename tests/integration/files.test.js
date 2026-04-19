const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('File Storage Integration Tests (Cloudflare R2)', () => {
    let token, user, workspace, category, document;

    beforeEach(async () => {
        // ua: підготовка середовища
        const auth = await getAuthToken();
        token = auth.token;
        user = auth.user;

        workspace = await prisma.workspace.create({
            data: {
                name: 'Storage Test WS',
                ownerId: user.id,
                users: { create: { userId: user.id, role: 'Owner' } },
            },
        });

        category = await prisma.category.create({
            data: { name: 'Assets', workspaceId: workspace.id },
        });

        document = await prisma.document.create({
            data: {
                title: 'Test Doc',
                content: '...',
                categoryId: category.id,
                ownerId: user.id
            },
        });
    });

    describe('POST /api/files/document/:id', () => {
        // ua: тестування успішного завантаження файлу
        test('should successfully upload a PDF file to R2', async () => {
            const res = await request(app)
                .post(`/api/files/document/${document.id}`)
                .set('Authorization', `Bearer ${token}`)
                .field('workspaceId', workspace.id)
                .attach('file', Buffer.from('fake-content'), 'test.pdf');

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);

            // ua: перевірка метаданих у базі (урл та розмір)
            const fileInDb = await prisma.file.findFirst({
                where: { documentId: document.id }
            });

            expect(fileInDb).not.toBeNull();
            expect(fileInDb.fileName).toBe('test.pdf');
            expect(fileInDb.url).toContain('cloudflarestorage.com');
            expect(fileInDb.size).toBeGreaterThan(0);
        });




        // ua: Security Test (Viewer отримує 403) - перевірка ролей та прав доступу
        test('should return 403 if Viewer tries to upload a file', async () => {
            const viewerAuth = await getAuthToken('viewer@test.com');

            // ua: додаємо юзера у воркспейс як Viewer
            await prisma.userWorkspace.create({
                data: {
                    userId: viewerAuth.user.id,
                    workspaceId: workspace.id,
                    role: 'Viewer'
                },
            });

            const res = await request(app)
                .post(`/api/files/document/${document.id}`)
                .set('Authorization', `Bearer ${viewerAuth.token}`)
                .attach('file', Buffer.from('test'), 'image.png');

            expect(res.statusCode).toBe(403);
        });

    });

    describe('DELETE /api/files/:id', () => {
        test('should delete file from Cloudflare R2 and DB', async () => {
            // ua: спочатку реально завантажується файл через API
            const uploadRes = await request(app)
                .post(`/api/files/document/${document.id}`)
                .set('Authorization', `Bearer ${token}`)
                .attach('file', Buffer.from('content-to-delete'), 'delete-me.pdf');

            const fileId = uploadRes.body.data.file.id;

            // ua: видалення його через DELETE ендпоінт
            const res = await request(app)
                .delete(`/api/files/${fileId}`)
                .set('Authorization', `Bearer ${token}`);

            // ua: чек
            expect(res.statusCode).toBe(204);

            const fileInDb = await prisma.file.findUnique({ where: { id: fileId } });
            expect(fileInDb).toBeNull(); // ua: перевіряємо чи зник запис із бази
        });
    });
});
