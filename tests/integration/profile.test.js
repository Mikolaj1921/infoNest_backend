const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');
const prisma = require('../../src/config/db');

describe('Profile & Security Integration Tests', () => {
    // data 
    let token, user;
    const TEST_EMAIL = 'profile@test.com';
    const HELPERS_PASSWORD = 'hashed_password_333';

    beforeEach(async () => {
        // ua: підготовка юзера (хелпер створює його з паролем hashed_password_333)
        const auth = await getAuthToken(TEST_EMAIL);
        token = auth.token;
        user = auth.user;
    });

    describe('PATCH /api/users/update-password', () => {
        test('should successfully change password and invalidate old one', async () => {
            // change password
            const res = await request(app)
                .patch('/api/users/update-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    oldPassword: HELPERS_PASSWORD,
                    newPassword: 'NewSecurePass456!'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('successfully');

            // ua: спроба залогінитися зі старим паролем (401)
            const oldLoginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: TEST_EMAIL,
                    password: HELPERS_PASSWORD
                });

            expect(oldLoginRes.statusCode).toBe(401);

            // ua: auth (200)
            const newLoginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: TEST_EMAIL,
                    password: 'NewSecurePass456!'
                });

            expect(newLoginRes.statusCode).toBe(200);
            expect(newLoginRes.body.data.user).toBeDefined();
        });

        test('should return 401 if old password is incorrect', async () => {
            const res = await request(app)
                .patch('/api/users/update-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    oldPassword: 'WrongOldPassword',
                    newPassword: 'SomeNewPass123!'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('DELETE /api/users/delete-account', () => {
        test('should delete user and all associated data', async () => {
            // delete account
            const res = await request(app)
                .delete('/api/users/delete-account')
                .set('Authorization', `Bearer ${token}`)
                .send({ password: HELPERS_PASSWORD });

            expect(res.statusCode).toBe(200);

            // check if user is deleted from DB
            const deletedUser = await prisma.user.findUnique({
                where: { id: user.id }
            });
            expect(deletedUser).toBeNull();

            // ua: 401 при спробі залогінитися після видалення
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: TEST_EMAIL,
                    password: HELPERS_PASSWORD
                });

            expect(loginRes.statusCode).toBe(401);
        });
    });
});
