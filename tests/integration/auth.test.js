const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/db');

describe('Auth Integration Tests', () => {
    const testUser = {
        email: 'test-user@example.com',
        password: 'password123',
        name: 'Test_User',
    };

    // ua: тести для реєстрації користувача
    describe('POST /api/auth/register', () => {
        test('should successfully register a new user', async () => {
            // ua: виклик API для реєстрації нового юзера
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe(testUser.email);

            // ua: перевірка в бд, чи юзер був створений
            const userInDb = await prisma.user.findUnique({
                where: { email: testUser.email },
            });
            expect(userInDb).not.toBeNull();
            expect(userInDb.name).toBe(testUser.name);
        });

        test('should return 400 if email is already taken', async () => {
            // ua: створення юзера наперед через prisma, щоб спровокувати помилку
            await prisma.user.create({
                data: {
                    email: testUser.email,
                    name: testUser.name,
                    password: 'hashed_password'
                },
            });

            // ua: спроба зареєструватися з тим самим email через API
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('exists');
        });
    });

    // ua: тести для входу в систему (Login)
    describe('POST /api/auth/login', () => {
        test('should successfully login user and return cookies', async () => {
            // ua: реєстр юзера через API
            await request(app).post('/api/auth/register').send(testUser);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            // ua: перевірка чи встановлені куки з токенами
            expect(res.header['set-cookie']).toBeDefined();
            const hasAccessToken = res.header['set-cookie'].some((c) =>
                c.includes('accessToken'),
            );
            expect(hasAccessToken).toBe(true);
        });
    });

    // ua: тести для виходу із системи (Logout)
    describe('POST /api/auth/logout', () => {
        test('should successfully logout and clear refresh token in DB', async () => {
            // ua: лог щоб отримати актуальні куки
            await request(app).post('/api/auth/register').send(testUser);
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });

            const cookies = loginRes.header['set-cookie'];

            // ua: виклик логаутa, передаючи отримані куки
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Cookie', cookies);

            expect(res.statusCode).toBe(200);

            // ua: перевірка чи refreshToken у базі став нулл після логауту
            const userInDb = await prisma.user.findUnique({
                where: { email: testUser.email },
            });
            expect(userInDb.refreshToken).toBeNull();
        });
    });
});
