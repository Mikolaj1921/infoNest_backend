
const jwt = require('jsonwebtoken');
const config = require('../../../src/config/index');
const tokenUtils = require('../../../src/utils/token.utils');

describe('Token Utils Unit Tests', () => {
    const userId = 'user-123';

    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        res = {
            cookie: jest.fn(),
            clearCookie: jest.fn(),
        };
    });

    // ua: тести генерації токенів
    describe('generateAccessToken', () => {
        test('should generate a valid access token', () => {
            const token = tokenUtils.generateAccessToken(userId);

            const decoded = jwt.verify(
                token,
                config.JWT_ACCESS_SECRET,
            );

            expect(decoded.id).toBe(userId);
            expect(decoded.exp).toBeDefined();
        });
    });

    describe('generateRefreshToken', () => {
        test('should generate a valid refresh token', () => {
            const token = tokenUtils.generateRefreshToken(userId);

            const decoded = jwt.verify(
                token,
                config.JWT_REFRESH_SECRET,
            );

            expect(decoded.id).toBe(userId);
            expect(decoded.exp).toBeDefined();
        });
    });

    // ua: тести перевірки токенів
    describe('verifyToken', () => {
        test('should return decoded payload for valid token', () => {
            const token = jwt.sign(
                { id: userId },
                config.JWT_ACCESS_SECRET,
                { expiresIn: '15m' },
            );

            const result = tokenUtils.verifyToken(
                token,
                config.JWT_ACCESS_SECRET,
            );

            expect(result).toEqual(
                expect.objectContaining({ id: userId }),
            );
        });

        test('should return null for invalid token', () => {
            const result = tokenUtils.verifyToken(
                'invalid-token',
                config.JWT_ACCESS_SECRET,
            );

            expect(result).toBeNull();
        });

        test('should return null when token is verified with wrong secret', () => {
            const token = jwt.sign(
                { id: userId },
                config.JWT_ACCESS_SECRET,
            );

            const result = tokenUtils.verifyToken(
                token,
                config.JWT_REFRESH_SECRET,
            );

            expect(result).toBeNull();
        });
    });

    // ua: тести встановлення cookies
    describe('sendTokensAsCookies', () => {
        test('should set access and refresh tokens in cookies', () => {
            const result = tokenUtils.sendTokensAsCookies(res, userId);

            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();

            expect(res.cookie).toHaveBeenCalledTimes(2);

            expect(res.cookie).toHaveBeenNthCalledWith(
                1,
                'accessToken',
                result.accessToken,
                expect.objectContaining({
                    httpOnly: true,
                    secure: config.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 15 * 60 * 1000,
                }),
            );

            expect(res.cookie).toHaveBeenNthCalledWith(
                2,
                'refreshToken',
                result.refreshToken,
                expect.objectContaining({
                    httpOnly: true,
                    secure: config.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                }),
            );

            expect(
                jwt.verify(result.accessToken, config.JWT_ACCESS_SECRET).id,
            ).toBe(userId);

            expect(
                jwt.verify(result.refreshToken, config.JWT_REFRESH_SECRET).id,
            ).toBe(userId);
        });
    });

    // ua: тести очищення cookies
    describe('clearTokensCookies', () => {
        test('should clear access and refresh token cookies', () => {
            tokenUtils.clearTokensCookies(res);

            expect(res.clearCookie).toHaveBeenCalledTimes(2);

            expect(res.clearCookie).toHaveBeenNthCalledWith(
                1,
                'accessToken',
                expect.objectContaining({
                    httpOnly: true,
                    secure: config.NODE_ENV === 'production',
                    sameSite: 'strict',
                }),
            );

            expect(res.clearCookie).toHaveBeenNthCalledWith(
                2,
                'refreshToken',
                expect.objectContaining({
                    httpOnly: true,
                    secure: config.NODE_ENV === 'production',
                    sameSite: 'strict',
                }),
            );
        });
    });
});
