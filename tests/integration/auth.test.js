
const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/db');

// ua: мок відправлення welcome email, щоб інтеграційні тести
// не залежали від зовнішнього поштового сервісу
jest.mock('../../src/utils/email', () =>
    jest.fn().mockImplementation(() => ({
        sendWelcome: jest.fn().mockResolvedValue(undefined),
    })),
);

describe('Auth Integration Tests', () => {
    const testUser = {
        email: 'test-user@example.com',
        password: 'password123',
        name: 'Test_User',
    };

    // ua: тести для реєстрації користувача
    describe('POST /api/auth/register', () => {
        test('should successfully register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toEqual(
                expect.objectContaining({
                    email: testUser.email,
                    name: testUser.name,
                }),
            );

            // ua: перевірка, що пароль не повертається у відповіді
            expect(response.body.data.user).not.toHaveProperty('password');

            // ua: перевірка встановлення токенів у cookies
            expect(response.headers['set-cookie']).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('accessToken='),
                    expect.stringContaining('refreshToken='),
                ]),
            );

            // ua: перевірка фактичного створення користувача в БД
            const createdUser = await prisma.user.findUnique({
                where: { email: testUser.email },
            });

            expect(createdUser).not.toBeNull();
            expect(createdUser.email).toBe(testUser.email);
            expect(createdUser.password).not.toBe(testUser.password);
        });

        test('should return 400 when registering with an existing email', async () => {
            await request(app)
                .post('/api/auth/register')
                .send(testUser);

            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should return 400 when registration data is invalid', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: '123',
                    name: 'A',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    // ua: тести для входу користувача
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send(testUser);
        });

        test('should successfully log in with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toEqual(
                expect.objectContaining({
                    email: testUser.email,
                    name: testUser.name,
                }),
            );

            // ua: пароль не повинен повертатися клієнту
            expect(response.body.data.user).not.toHaveProperty('password');

            // ua: перевірка встановлення токенів
            expect(response.headers['set-cookie']).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('accessToken='),
                    expect.stringContaining('refreshToken='),
                ]),
            );
        });

        test('should return 401 when password is incorrect', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrong-password',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        test('should return 401 when user does not exist', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'unknown@example.com',
                    password: testUser.password,
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        test('should return 400 when login data is invalid', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: '',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    // ua: тести для виходу користувача
    describe('POST /api/auth/logout', () => {
        test('should successfully log out an authenticated user', async () => {
            await request(app)
                .post('/api/auth/register')
                .send(testUser);

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            const response = await request(app)
                .post('/api/auth/logout')
                .set('Cookie', loginResponse.headers['set-cookie']);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // ua: перевірка видалення refresh token із БД
            const user = await prisma.user.findUnique({
                where: { email: testUser.email },
            });

            expect(user.refreshToken).toBeNull();

            // ua: перевірка очищення cookies у відповіді
            expect(response.headers['set-cookie']).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('accessToken=;'),
                    expect.stringContaining('refreshToken=;'),
                ]),
            );
        });

        test('should return 401 when logging out without authentication', async () => {
            const response = await request(app)
                .post('/api/auth/logout');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
