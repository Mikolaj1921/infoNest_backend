
const prisma = require('../../../src/config/db');
const { getPagination } = require('../../../src/utils/pagination');
const workspaceService = require('../../../src/services/workspace.service');

// ua: мок Prisma для ізоляції сервісу від бази даних
jest.mock('../../../src/config/db', () => ({
    $transaction: jest.fn(),
    workspace: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    userWorkspace: {
        create: jest.fn(),
    },
}));

// ua: мок утиліти пагінації
jest.mock('../../../src/utils/pagination', () => ({
    getPagination: jest.fn(),
}));

describe('Workspace Service Unit Tests', () => {
    const userId = 'user-123';
    const workspaceId = 'workspace-123';

    const mockWorkspace = {
        id: workspaceId,
        name: 'Development WS',
        visibility: 'PRIVATE',
        ownerId: userId,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        getPagination.mockReturnValue({
            skip: 0,
            take: 10,
            page: 1,
            limit: 10,
        });
    });

    // ua: тести створення воркспейсу
    describe('createWorkspace', () => {
        test('should create workspace and assign Owner role in transaction', async () => {
            const tx = {
                workspace: {
                    create: jest.fn().mockResolvedValue(mockWorkspace),
                },
                userWorkspace: {
                    create: jest.fn().mockResolvedValue({
                        userId,
                        workspaceId,
                        role: 'Owner',
                    }),
                },
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(tx));

            const result = await workspaceService.createWorkspace(userId, {
                name: 'Development WS',
                visibility: 'PRIVATE',
            });

            expect(prisma.$transaction).toHaveBeenCalledTimes(1);

            expect(tx.workspace.create).toHaveBeenCalledWith({
                data: {
                    name: 'Development WS',
                    visibility: 'PRIVATE',
                    ownerId: userId,
                },
            });

            expect(tx.userWorkspace.create).toHaveBeenCalledWith({
                data: {
                    userId,
                    workspaceId,
                    role: 'Owner',
                },
            });

            expect(result).toEqual(mockWorkspace);
        });

        test('should propagate error when workspace creation fails', async () => {
            const error = new Error('Workspace creation failed');

            const tx = {
                workspace: {
                    create: jest.fn().mockRejectedValue(error),
                },
                userWorkspace: {
                    create: jest.fn(),
                },
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(tx));

            await expect(
                workspaceService.createWorkspace(userId, {
                    name: 'Development WS',
                    visibility: 'PRIVATE',
                }),
            ).rejects.toThrow('Workspace creation failed');

            expect(tx.userWorkspace.create).not.toHaveBeenCalled();
        });

        test('should propagate error when Owner membership creation fails', async () => {
            const error = new Error('Membership creation failed');

            const tx = {
                workspace: {
                    create: jest.fn().mockResolvedValue(mockWorkspace),
                },
                userWorkspace: {
                    create: jest.fn().mockRejectedValue(error),
                },
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(tx));

            await expect(
                workspaceService.createWorkspace(userId, {
                    name: 'Development WS',
                    visibility: 'PRIVATE',
                }),
            ).rejects.toThrow('Membership creation failed');
        });
    });

    // ua: тести отримання списку воркспейсів
    describe('getAllWorkspaces', () => {
        test('should return user workspaces with pagination metadata', async () => {
            const workspaces = [mockWorkspace];

            prisma.workspace.findMany.mockResolvedValue(workspaces);
            prisma.workspace.count.mockResolvedValue(1);

            const query = { page: '1', limit: '10' };

            const result = await workspaceService.getAllWorkspaces(userId, query);

            expect(getPagination).toHaveBeenCalledWith(query);

            expect(prisma.workspace.findMany).toHaveBeenCalledWith({
                where: {
                    users: {
                        some: { userId },
                    },
                },
                skip: 0,
                take: 10,
                include: {
                    _count: {
                        select: {
                            users: true,
                            categories: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            expect(prisma.workspace.count).toHaveBeenCalledWith({
                where: {
                    users: {
                        some: { userId },
                    },
                },
            });

            expect(result).toEqual({
                workspaces,
                pagination: {
                    page: 1,
                    limit: 10,
                    totalCount: 1,
                    totalPages: 1,
                },
            });
        });

        test('should return empty list when user has no workspaces', async () => {
            prisma.workspace.findMany.mockResolvedValue([]);
            prisma.workspace.count.mockResolvedValue(0);

            const result = await workspaceService.getAllWorkspaces(userId, {});

            expect(result.workspaces).toEqual([]);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                totalCount: 0,
                totalPages: 0,
            });
        });

        test('should return correct total pages for multiple pages', async () => {
            prisma.workspace.findMany.mockResolvedValue([mockWorkspace]);
            prisma.workspace.count.mockResolvedValue(25);

            const result = await workspaceService.getAllWorkspaces(userId, {});

            expect(result.pagination.totalPages).toBe(3);
        });

        test('should propagate error when database query fails', async () => {
            prisma.workspace.findMany.mockRejectedValue(
                new Error('Database error'),
            );
            prisma.workspace.count.mockResolvedValue(0);

            await expect(
                workspaceService.getAllWorkspaces(userId, {}),
            ).rejects.toThrow('Database error');
        });
    });

    // ua: тести оновлення воркспейсу
    describe('updateWorkspace', () => {
        test('should update workspace when current user is the owner', async () => {
            const updatedWorkspace = {
                ...mockWorkspace,
                name: 'Updated WS',
            };

            prisma.workspace.findUnique.mockResolvedValue(mockWorkspace);
            prisma.workspace.update.mockResolvedValue(updatedWorkspace);

            const result = await workspaceService.updateWorkspace(
                workspaceId,
                userId,
                { name: 'Updated WS' },
            );

            expect(prisma.workspace.findUnique).toHaveBeenCalledWith({
                where: { id: workspaceId },
            });

            expect(prisma.workspace.update).toHaveBeenCalledWith({
                where: { id: workspaceId },
                data: { name: 'Updated WS' },
            });

            expect(result).toEqual(updatedWorkspace);
        });

        test('should throw 403 when workspace does not exist', async () => {
            prisma.workspace.findUnique.mockResolvedValue(null);

            await expect(
                workspaceService.updateWorkspace(workspaceId, userId, {
                    name: 'Updated WS',
                }),
            ).rejects.toMatchObject({
                statusCode: 403,
                message: 'Workspace not found or you do not have permissions',
            });

            expect(prisma.workspace.update).not.toHaveBeenCalled();
        });

        test('should throw 403 when current user is not the owner', async () => {
            prisma.workspace.findUnique.mockResolvedValue({
                ...mockWorkspace,
                ownerId: 'another-user',
            });

            await expect(
                workspaceService.updateWorkspace(workspaceId, userId, {
                    name: 'Hacked WS',
                }),
            ).rejects.toMatchObject({
                statusCode: 403,
            });

            expect(prisma.workspace.update).not.toHaveBeenCalled();
        });

        test('should propagate error when database update fails', async () => {
            prisma.workspace.findUnique.mockResolvedValue(mockWorkspace);
            prisma.workspace.update.mockRejectedValue(
                new Error('Update failed'),
            );

            await expect(
                workspaceService.updateWorkspace(workspaceId, userId, {
                    name: 'Updated WS',
                }),
            ).rejects.toThrow('Update failed');
        });
    });

    // ua: тести видалення воркспейсу
    describe('deleteWorkspace', () => {
        test('should delete workspace when current user is the owner', async () => {
            prisma.workspace.findUnique.mockResolvedValue(mockWorkspace);
            prisma.workspace.delete.mockResolvedValue(mockWorkspace);

            const result = await workspaceService.deleteWorkspace(
                workspaceId,
                userId,
            );

            expect(prisma.workspace.findUnique).toHaveBeenCalledWith({
                where: { id: workspaceId },
            });

            expect(prisma.workspace.delete).toHaveBeenCalledWith({
                where: { id: workspaceId },
            });

            expect(result).toEqual(mockWorkspace);
        });

        test('should throw 403 when workspace does not exist', async () => {
            prisma.workspace.findUnique.mockResolvedValue(null);

            await expect(
                workspaceService.deleteWorkspace(workspaceId, userId),
            ).rejects.toMatchObject({
                statusCode: 403,
                message: 'Workspace not found or you do not have permissions',
            });

            expect(prisma.workspace.delete).not.toHaveBeenCalled();
        });

        test('should throw 403 when current user is not the owner', async () => {
            prisma.workspace.findUnique.mockResolvedValue({
                ...mockWorkspace,
                ownerId: 'another-user',
            });

            await expect(
                workspaceService.deleteWorkspace(workspaceId, userId),
            ).rejects.toMatchObject({
                statusCode: 403,
            });

            expect(prisma.workspace.delete).not.toHaveBeenCalled();
        });

        test('should propagate error when database deletion fails', async () => {
            prisma.workspace.findUnique.mockResolvedValue(mockWorkspace);
            prisma.workspace.delete.mockRejectedValue(
                new Error('Delete failed'),
            );

            await expect(
                workspaceService.deleteWorkspace(workspaceId, userId),
            ).rejects.toThrow('Delete failed');
        });
    });
});
