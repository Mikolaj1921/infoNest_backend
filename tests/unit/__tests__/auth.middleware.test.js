
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
}));

jest.mock('../../../src/config/db', () => ({
    user: {
        findUnique: jest.fn(),
    },
}));

const jwt = require('jsonwebtoken');
const prisma = require('../../../src/config/db');
const { protect } = require('../../../src/middlewares/auth.middleware');

describe('Auth Middleware Unit Tests', () => {
    let req;
    let res;
    let next;

    const decodedToken = { id: 'user-123' };

    const currentUser = {
        id: 'user-123',
        name: 'Test_User',
        email: 'test@example.com',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            signedCookies: {},
            cookies: {},
            headers: {},
        };

        res = {};
        next = jest.fn();
    });

    // ua: перевірка доступу за токеном
    describe('protect', () => {
        test('should authenticate user with signed cookie', async () => {
            req.signedCookies.accessToken = 'valid-token';
            jwt.verify.mockReturnValue(decodedToken);
            prisma.user.findUnique.mockResolvedValue(currentUser);

            await protect(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                'valid-token',
                expect.any(String),
            );

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: decodedToken.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            });

            expect(req.user).toEqual(currentUser);
            expect(next).toHaveBeenCalledWith();
        });

        test('should authenticate user with regular cookie', async () => {
            req.cookies.accessToken = 'cookie-token';
            jwt.verify.mockReturnValue(decodedToken);
            prisma.user.findUnique.mockResolvedValue(currentUser);

            await protect(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                'cookie-token',
                expect.any(String),
            );

            expect(req.user).toEqual(currentUser);
            expect(next).toHaveBeenCalledWith();
        });

        test('should authenticate user with Bearer token', async () => {
            req.headers.authorization = 'Bearer header-token';
            jwt.verify.mockReturnValue(decodedToken);
            prisma.user.findUnique.mockResolvedValue(currentUser);

            await protect(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                'header-token',
                expect.any(String),
            );

            expect(req.user).toEqual(currentUser);
            expect(next).toHaveBeenCalledWith();
        });

        test('should prioritize signed cookie over other token sources', async () => {
            req.signedCookies.accessToken = 'signed-token';
            req.cookies.accessToken = 'regular-token';
            req.headers.authorization = 'Bearer header-token';

            jwt.verify.mockReturnValue(decodedToken);
            prisma.user.findUnique.mockResolvedValue(currentUser);

            await protect(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                'signed-token',
                expect.any(String),
            );
        });

        test('should reject request when token is missing', async () => {
            await protect(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Unauthorized. Please log in to continue.',
                    statusCode: 401,
                }),
            );

            expect(jwt.verify).not.toHaveBeenCalled();
            expect(prisma.user.findUnique).not.toHaveBeenCalled();
        });

        test('should reject request when user no longer exists', async () => {
            req.cookies.accessToken = 'valid-token';

            jwt.verify.mockReturnValue(decodedToken);
            prisma.user.findUnique.mockResolvedValue(null);

            await protect(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'The user associated with this token no longer exists.',
                    statusCode: 401,
                }),
            );

            expect(req.user).toBeUndefined();
        });

        test('should pass JWT verification errors to next middleware', async () => {
            req.cookies.accessToken = 'invalid-token';

            const verificationError = new Error('Invalid token');

            jwt.verify.mockImplementation(() => {
                throw verificationError;
            });

            await protect(req, res, next);

            expect(next).toHaveBeenCalledWith(verificationError);
            expect(prisma.user.findUnique).not.toHaveBeenCalled();
        });
    });
});
