const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Global Search Integration Tests', () => {
    // eslint-disable-next-line
    let token, user, workspace, category, document;

    beforeEach(async () => {
        const auth = await getAuthToken();
        token = auth.token;
        user = auth.user;

        // ua: створення воркспейс та документ для пошуку
        workspace = await prisma.workspace.create({
            data: {
                name: 'Searchable Workspace',
                ownerId: user.id,
                users: { create: { userId: user.id, role: 'Owner' } }
            }
        });

        category = await prisma.category.create({
            data: { name: 'Marketing', workspaceId: workspace.id }
        });

        document = await prisma.document.create({
            data: {
                title: 'Unique Campaign Name',
                content: 'Some very specific content about growth.',
                categoryId: category.id,
                ownerId: user.id
            }
        });
    });

    test('should find document by title or content', async () => {
        // ua: пошук за частиною заголовка
        const res = await request(app)
            .get('/api/search?query=Unique')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.documents.length).toBeGreaterThan(0);
        expect(res.body.data.documents[0].title).toBe('Unique Campaign Name');
    });

    test('should find category by name', async () => {
        // ua: пошук за назвою категорії
        const res = await request(app)
            .get('/api/search?query=Market')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.categories.length).toBeGreaterThan(0);
        expect(res.body.data.categories[0].name).toBe('Marketing');
    });

    test('should NOT find documents from workspaces where user is not a member', async () => {
        // ua: створення іншого юзера та його приватний документ
        const strangerAuth = await getAuthToken('stranger@test.com');
        const strangerWS = await prisma.workspace.create({
            data: { name: 'Secret WS', ownerId: strangerAuth.user.id }
        });
        const strangerCat = await prisma.category.create({
            data: { name: 'Secret Cat', workspaceId: strangerWS.id }
        });
        await prisma.document.create({
            data: { title: 'Top Secret Document', content: '...', categoryId: strangerCat.id, ownerId: strangerAuth.user.id }
        });

        // ua: спроба -  перший юзер намагається знайти цей секретний документ
        const res = await request(app)
            .get('/api/search?query=Secret')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        // ua: результати мають бути пустими для даного юзера
        expect(res.body.data.documents.length).toBe(0);
        expect(res.body.data.categories.length).toBe(0);
    });

    test('should return 400 if search query is too short', async () => {
        const res = await request(app)
            .get('/api/search?query=a')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
    });
});
