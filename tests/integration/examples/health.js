const request = require('supertest');
const app = require('../../src/app'); // Імпорт app

describe('Health Check API', () => {
    test('GET /api/health should return 200', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
    });
});