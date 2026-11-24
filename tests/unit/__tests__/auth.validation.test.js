
const {
    registerSchema,
    loginSchema,
} = require('../../../src/validations/auth.validation');

describe('Auth Validation Unit Tests', () => {
    // ua: тести валідації реєстрації
    describe('registerSchema', () => {
        const validData = {
            body: {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test_User',
            },
        };

        test('should accept valid registration data', () => {
            const result = registerSchema.safeParse(validData);

            expect(result.success).toBe(true);
            expect(result.data.body).toEqual(validData.body);
        });

        test('should reject invalid email', () => {
            const result = registerSchema.safeParse({
                body: {
                    ...validData.body,
                    email: 'invalid-email',
                },
            });

            expect(result.success).toBe(false);
        });

        test('should reject password shorter than 8 characters', () => {
            const result = registerSchema.safeParse({
                body: {
                    ...validData.body,
                    password: '1234567',
                },
            });

            expect(result.success).toBe(false);
        });

        test('should reject name shorter than 3 characters', () => {
            const result = registerSchema.safeParse({
                body: {
                    ...validData.body,
                    name: 'AB',
                },
            });

            expect(result.success).toBe(false);
        });

        test('should reject name longer than 30 characters', () => {
            const result = registerSchema.safeParse({
                body: {
                    ...validData.body,
                    name: 'A'.repeat(31),
                },
            });

            expect(result.success).toBe(false);
        });

        test('should reject registration data without body', () => {
            const result = registerSchema.safeParse({});

            expect(result.success).toBe(false);
        });

        test('should reject registration data with missing required fields', () => {
            const result = registerSchema.safeParse({
                body: {
                    email: 'test@example.com',
                },
            });

            expect(result.success).toBe(false);
        });
    });

    // ua: тести валідації входу
    describe('loginSchema', () => {
        const validData = {
            body: {
                email: 'test@example.com',
                password: 'password123',
            },
        };

        test('should accept valid login data', () => {
            const result = loginSchema.safeParse(validData);

            expect(result.success).toBe(true);
            expect(result.data.body).toEqual(validData.body);
        });

        test('should reject invalid email', () => {
            const result = loginSchema.safeParse({
                body: {
                    ...validData.body,
                    email: 'invalid-email',
                },
            });

            expect(result.success).toBe(false);
        });

        test('should reject empty password', () => {
            const result = loginSchema.safeParse({
                body: {
                    ...validData.body,
                    password: '',
                },
            });

            expect(result.success).toBe(false);
        });

        test('should reject login data without body', () => {
            const result = loginSchema.safeParse({});

            expect(result.success).toBe(false);
        });

        test('should reject login data with missing required fields', () => {
            const result = loginSchema.safeParse({
                body: {
                    email: 'test@example.com',
                },
            });

            expect(result.success).toBe(false);
        });
    });
});
