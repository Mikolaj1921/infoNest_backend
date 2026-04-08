// ua: Інтеграційний тест для перевірки авторизації 
const request = require('supertest');
const app = require('../../src/app');
const { getAuthToken } = require('../helpers/auth.helper');

describe('Auth Flow (Bearer Token)', () => {
    test(async () => {
        // токен через хелпер
        const { token, user } = await getAuthToken();

        // запит до рута /me
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        // 3. Перевірка
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.id).toBe(user.id);
    });
});
