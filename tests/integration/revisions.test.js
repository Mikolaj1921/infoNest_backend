const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Document Versioning (Revisions) Integration Tests', () => {
    let token, user, workspace, category, document;

    beforeEach(async () => {
        // ua: підготовка даних
        const auth = await getAuthToken();
        token = auth.token;
        user = auth.user;

        workspace = await prisma.workspace.create({
            data: {
                name: 'Versioning WS',
                ownerId: user.id,
                users: { create: { userId: user.id, role: 'Owner' } },
            },
        });

        category = await prisma.category.create({
            data: { name: 'Docs', workspaceId: workspace.id },
        });

        document = await prisma.document.create({
            data: {
                title: 'Initial Title',
                content: 'Original Content',
                categoryId: category.id,
                ownerId: user.id,
            },
        });
    });

    test('should automatically create a revision with old content after update', async () => {
        const newContent = 'Updated Content';

        // ua: update документа через апі
        const updateRes = await request(app)
            .patch(`/api/documents/${document.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: newContent });

        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.data.document.content).toBe(newContent);

        // ua: перевірка чи зявилася ревізія через API
        const revRes = await request(app)
            .get(`/api/documents/${document.id}/revisions`)
            .set('Authorization', `Bearer ${token}`);

        expect(revRes.statusCode).toBe(200);
        expect(revRes.body.results).toBe(1);

        // ua: перевірка цілісності, ревізія повинна містити старий контент та інформацію про редактора
        expect(revRes.body.data.revisions[0].content).toBe('Original Content');
        expect(revRes.body.data.revisions[0].editorId).toBe(user.id);
    });
});
