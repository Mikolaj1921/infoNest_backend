
jest.mock('../../../src/config/db', () => ({
    user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

jest.mock('../../../src/services/activity.service', () => ({
    logActivity: jest.fn(),
}));

jest.mock('../../../src/services/file.service', () => ({
    deleteFile: jest.fn(),
}));

jest.mock('../../../src/utils/logger', () => ({
    error: jest.fn(),
}));

const authService = require('../../../src/services/auth.service');
const prisma = require('../../../src/config/db');
const bcrypt = require('bcryptjs');
const activityService = require('../../../src/services/activity.service');
const fileService = require('../../../src/services/file.service');
const logger = require('../../../src/utils/logger');
// eslint-disable-next-line
const AppError = require('../../../src/utils/appError');

describe('AuthService Unit Tests', () => {
    const userData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test_User',
        password: 'password123',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ua: тести реєстрації користувача
    describe('register', () => {
        test('should successfully register a new user', async () => {
            const createdUser = {
                id: userData.id,
                email: userData.email,
                name: userData.name,
            };

            prisma.user.findUnique.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashed-password');
            prisma.user.create.mockResolvedValue(createdUser);

            const result = await authService.register(userData);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: userData.email },
            });

            expect(bcrypt.hash).toHaveBeenCalledWith(
                userData.password,
                12,
            );

            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: userData.email,
                    name: userData.name,
                    password: 'hashed-password',
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            });

            expect(result).toEqual({ user: createdUser });
        });

        test('should throw an error when email already exists', async () => {
            prisma.user.findUnique.mockResolvedValue(userData);

            await expect(
                authService.register(userData),
            ).rejects.toMatchObject({
                message: 'A user with this email already exists.',
                statusCode: 400,
            });

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(prisma.user.create).not.toHaveBeenCalled();
        });
    });

    // ua: тести входу користувача
    describe('login', () => {
        test('should successfully log in with valid credentials', async () => {
            const databaseUser = {
                ...userData,
                password: 'hashed-password',
            };

            prisma.user.findUnique.mockResolvedValue(databaseUser);
            bcrypt.compare.mockResolvedValue(true);

            const result = await authService.login(
                userData.email,
                userData.password,
            );

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: userData.email },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    password: true,
                },
            });

            expect(bcrypt.compare).toHaveBeenCalledWith(
                userData.password,
                'hashed-password',
            );

            expect(result.user).toEqual({
                id: userData.id,
                email: userData.email,
                name: userData.name,
            });

            expect(result.user).not.toHaveProperty('password');
        });

        test('should throw an error when user does not exist', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(
                authService.login(userData.email, userData.password),
            ).rejects.toMatchObject({
                message: 'Incorrect email or password',
                statusCode: 401,
            });

            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        test('should throw an error when password is incorrect', async () => {
            prisma.user.findUnique.mockResolvedValue({
                ...userData,
                password: 'hashed-password',
            });

            bcrypt.compare.mockResolvedValue(false);

            await expect(
                authService.login(userData.email, userData.password),
            ).rejects.toMatchObject({
                message: 'Incorrect email or password',
                statusCode: 401,
            });
        });
    });

    // ua: тести роботи з refresh token
    describe('updateRefreshToken', () => {
        test('should save refresh token for user', async () => {
            prisma.user.update.mockResolvedValue({});

            await authService.updateRefreshToken(
                userData.id,
                'refresh-token',
            );

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userData.id },
                data: { refreshToken: 'refresh-token' },
            });
        });
    });

    describe('findUserByRefreshToken', () => {
        test('should find user by refresh token', async () => {
            prisma.user.findFirst.mockResolvedValue(userData);

            const result = await authService.findUserByRefreshToken(
                'refresh-token',
            );

            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: { refreshToken: 'refresh-token' },
            });

            expect(result).toEqual(userData);
        });

        test('should return null when token does not belong to any user', async () => {
            prisma.user.findFirst.mockResolvedValue(null);

            const result = await authService.findUserByRefreshToken(
                'unknown-token',
            );

            expect(result).toBeNull();
        });
    });

    describe('removeRefreshToken', () => {
        test('should remove refresh token from user', async () => {
            prisma.user.update.mockResolvedValue({});

            await authService.removeRefreshToken(userData.id);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userData.id },
                data: { refreshToken: null },
            });
        });
    });

    // ua: тести зміни пароля
    describe('updatePassword', () => {
        test('should successfully update user password', async () => {
            prisma.user.findUnique.mockResolvedValue({
                ...userData,
                password: 'old-hashed-password',
            });

            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('new-hashed-password');
            prisma.user.update.mockResolvedValue({
                ...userData,
                password: 'new-hashed-password',
                refreshToken: null,
            });

            const result = await authService.updatePassword(
                userData.id,
                'old-password',
                'new-password',
            );

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: userData.id },
            });

            expect(bcrypt.compare).toHaveBeenCalledWith(
                'old-password',
                'old-hashed-password',
            );

            expect(bcrypt.hash).toHaveBeenCalledWith(
                'new-password',
                12,
            );

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userData.id },
                data: {
                    password: 'new-hashed-password',
                    refreshToken: null,
                },
            });

            expect(activityService.logActivity).toHaveBeenCalledWith(
                null,
                userData.id,
                'PASSWORD_CHANGED',
            );

            expect(result.password).toBe('new-hashed-password');
        });

        test('should throw an error when user does not exist', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(
                authService.updatePassword(
                    userData.id,
                    'old-password',
                    'new-password',
                ),
            ).rejects.toMatchObject({
                message: 'User not found',
                statusCode: 404,
            });

            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        test('should throw an error when old password is incorrect', async () => {
            prisma.user.findUnique.mockResolvedValue({
                ...userData,
                password: 'old-hashed-password',
            });

            bcrypt.compare.mockResolvedValue(false);

            await expect(
                authService.updatePassword(
                    userData.id,
                    'wrong-password',
                    'new-password',
                ),
            ).rejects.toMatchObject({
                message: 'The current password you entered is incorrect',
                statusCode: 401,
            });

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(prisma.user.update).not.toHaveBeenCalled();
        });
    });

    // ua: тести видалення акаунта
    describe('deleteAccount', () => {
        test('should successfully delete user account and associated files', async () => {
            const userWithFiles = {
                ...userData,
                password: 'hashed-password',
                files: [
                    { id: 'file-1' },
                    { id: 'file-2' },
                ],
            };

            prisma.user.findUnique.mockResolvedValue(userWithFiles);
            bcrypt.compare.mockResolvedValue(true);
            fileService.deleteFile.mockResolvedValue(undefined);
            prisma.user.delete.mockResolvedValue(userData);

            const result = await authService.deleteAccount(
                userData.id,
                'password123',
            );

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: userData.id },
                include: { files: true },
            });

            expect(fileService.deleteFile).toHaveBeenCalledTimes(2);
            expect(fileService.deleteFile).toHaveBeenNthCalledWith(
                1,
                'file-1',
            );
            expect(fileService.deleteFile).toHaveBeenNthCalledWith(
                2,
                'file-2',
            );

            expect(activityService.logActivity).toHaveBeenCalledWith(
                null,
                userData.id,
                'ACCOUNT_DELETED',
            );

            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: userData.id },
            });

            expect(result).toEqual(userData);
        });

        test('should delete account even when file deletion fails', async () => {
            const userWithFiles = {
                ...userData,
                password: 'hashed-password',
                files: [{ id: 'file-1' }],
            };

            prisma.user.findUnique.mockResolvedValue(userWithFiles);
            bcrypt.compare.mockResolvedValue(true);
            fileService.deleteFile.mockRejectedValue(
                new Error('R2 deletion failed'),
            );
            prisma.user.delete.mockResolvedValue(userData);

            const result = await authService.deleteAccount(
                userData.id,
                'password123',
            );

            expect(logger.error).toHaveBeenCalledWith(
                expect.stringContaining('Failed to delete file file-1'),
                {
                    userId: userData.id,
                    fileId: 'file-1',
                },
            );

            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: userData.id },
            });

            expect(result).toEqual(userData);
        });

        test('should throw an error when user does not exist', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(
                authService.deleteAccount(userData.id, 'password123'),
            ).rejects.toMatchObject({
                message: 'User not found',
                statusCode: 404,
            });

            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(fileService.deleteFile).not.toHaveBeenCalled();
            expect(prisma.user.delete).not.toHaveBeenCalled();
        });

        test('should throw an error when password is incorrect', async () => {
            prisma.user.findUnique.mockResolvedValue({
                ...userData,
                password: 'hashed-password',
                files: [{ id: 'file-1' }],
            });

            bcrypt.compare.mockResolvedValue(false);

            await expect(
                authService.deleteAccount(userData.id, 'wrong-password'),
            ).rejects.toMatchObject({
                message: 'Incorrect password. Account deletion cancelled.',
                statusCode: 401,
            });

            expect(fileService.deleteFile).not.toHaveBeenCalled();
            expect(prisma.user.delete).not.toHaveBeenCalled();
        });
    });
});
