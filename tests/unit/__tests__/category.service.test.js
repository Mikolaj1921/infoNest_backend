
const prisma = require('../../../src/config/db');
const categoryService = require('../../../src/services/category.service');

jest.mock('../../../src/config/db', () => ({
    workspace: {
        findUnique: jest.fn(),
    },
    category: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

jest.mock('../../../src/utils/pagination', () => ({
    getPagination: jest.fn(() => ({
        skip: 0,
        take: 10,
        page: 1,
        limit: 10,
    })),
}));

describe('Category Service Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createCategory', () => {
        test('should successfully create a category', async () => {
            const workspaceId = 'workspace-id';
            const name = 'Development';

            const workspace = { id: workspaceId };
            const category = {
                id: 'category-id',
                name,
                workspaceId,
            };

            prisma.workspace.findUnique.mockResolvedValue(workspace);
            prisma.category.create.mockResolvedValue(category);

            const result = await categoryService.createCategory(workspaceId, name);

            expect(prisma.workspace.findUnique).toHaveBeenCalledWith({
                where: { id: workspaceId },
            });

            expect(prisma.category.create).toHaveBeenCalledWith({
                data: {
                    name,
                    workspaceId,
                },
            });

            expect(result).toEqual(category);
        });

        test('should throw an error if workspace does not exist', async () => {
            prisma.workspace.findUnique.mockResolvedValue(null);

            await expect(
                categoryService.createCategory('workspace-id', 'Development'),
            ).rejects.toThrow('Workspace not found');

            expect(prisma.category.create).not.toHaveBeenCalled();
        });
    });

    describe('getWorkspaceCategories', () => {
        test('should successfully get workspace categories with pagination', async () => {
            const workspaceId = 'workspace-id';

            const categories = [
                {
                    id: 'category-1',
                    name: 'Development',
                    _count: { documents: 3 },
                },
                {
                    id: 'category-2',
                    name: 'Design',
                    _count: { documents: 1 },
                },
            ];

            prisma.workspace.findUnique.mockResolvedValue({ id: workspaceId });
            prisma.category.findMany.mockResolvedValue(categories);
            prisma.category.count.mockResolvedValue(2);

            const result = await categoryService.getWorkspaceCategories(
                workspaceId,
                {},
            );

            expect(prisma.workspace.findUnique).toHaveBeenCalledWith({
                where: { id: workspaceId },
            });

            expect(prisma.category.findMany).toHaveBeenCalledWith({
                where: { workspaceId },
                skip: 0,
                take: 10,
                include: {
                    _count: { select: { documents: true } },
                },
                orderBy: { name: 'asc' },
            });

            expect(prisma.category.count).toHaveBeenCalledWith({
                where: { workspaceId },
            });

            expect(result).toEqual({
                categories,
                pagination: {
                    page: 1,
                    limit: 10,
                    totalCount: 2,
                    totalPages: 1,
                },
            });
        });

        test('should return empty categories when workspace has none', async () => {
            prisma.workspace.findUnique.mockResolvedValue({ id: 'workspace-id' });
            prisma.category.findMany.mockResolvedValue([]);
            prisma.category.count.mockResolvedValue(0);

            const result = await categoryService.getWorkspaceCategories(
                'workspace-id',
                {},
            );

            expect(result.categories).toEqual([]);
            expect(result.pagination.totalCount).toBe(0);
            expect(result.pagination.totalPages).toBe(0);
        });

        test('should throw an error if workspace does not exist', async () => {
            prisma.workspace.findUnique.mockResolvedValue(null);

            await expect(
                categoryService.getWorkspaceCategories('workspace-id', {}),
            ).rejects.toThrow('Workspace not found');

            expect(prisma.category.findMany).not.toHaveBeenCalled();
            expect(prisma.category.count).not.toHaveBeenCalled();
        });
    });

    describe('updateCategory', () => {
        test('should successfully update a category', async () => {
            const id = 'category-id';
            const name = 'Updated category';

            const category = { id, name: 'Old category' };
            const updatedCategory = { id, name };

            prisma.category.findUnique.mockResolvedValue(category);
            prisma.category.update.mockResolvedValue(updatedCategory);

            const result = await categoryService.updateCategory(id, name);

            expect(prisma.category.findUnique).toHaveBeenCalledWith({
                where: { id },
            });

            expect(prisma.category.update).toHaveBeenCalledWith({
                where: { id },
                data: { name },
            });

            expect(result).toEqual(updatedCategory);
        });

        test('should throw an error if category does not exist', async () => {
            prisma.category.findUnique.mockResolvedValue(null);

            await expect(
                categoryService.updateCategory('category-id', 'Updated category'),
            ).rejects.toThrow('Category not found');

            expect(prisma.category.update).not.toHaveBeenCalled();
        });
    });

    describe('deleteCategory', () => {
        test('should successfully delete a category', async () => {
            const id = 'category-id';
            const category = {
                id,
                name: 'Development',
                workspaceId: 'workspace-id',
            };

            prisma.category.findUnique.mockResolvedValue(category);
            prisma.category.delete.mockResolvedValue(category);

            const result = await categoryService.deleteCategory(id);

            expect(prisma.category.findUnique).toHaveBeenCalledWith({
                where: { id },
            });

            expect(prisma.category.delete).toHaveBeenCalledWith({
                where: { id },
            });

            expect(result).toEqual(category);
        });

        test('should throw an error if category does not exist', async () => {
            prisma.category.findUnique.mockResolvedValue(null);

            await expect(
                categoryService.deleteCategory('category-id'),
            ).rejects.toThrow('Category not found');

            expect(prisma.category.delete).not.toHaveBeenCalled();
        });
    });

    describe('getWorkspaceStructure', () => {
        test('should successfully get workspace structure with documents', async () => {
            const workspaceId = 'workspace-id';

            const structure = [
                {
                    id: 'category-1',
                    name: 'Development',
                    documents: [
                        { id: 'document-1', title: 'Document 1' },
                        { id: 'document-2', title: 'Document 2' },
                    ],
                },
            ];

            prisma.workspace.findUnique.mockResolvedValue({ id: workspaceId });
            prisma.category.findMany.mockResolvedValue(structure);

            const result = await categoryService.getWorkspaceStructure(workspaceId);

            expect(prisma.workspace.findUnique).toHaveBeenCalledWith({
                where: { id: workspaceId },
            });

            expect(prisma.category.findMany).toHaveBeenCalledWith({
                where: { workspaceId },
                include: {
                    documents: {
                        orderBy: { createdAt: 'asc' },
                    },
                },
                orderBy: { createdAt: 'asc' },
            });

            expect(result).toEqual(structure);
        });

        test('should return an empty structure when workspace has no categories', async () => {
            prisma.workspace.findUnique.mockResolvedValue({ id: 'workspace-id' });
            prisma.category.findMany.mockResolvedValue([]);

            const result = await categoryService.getWorkspaceStructure('workspace-id');

            expect(result).toEqual([]);
        });

        test('should throw an error if workspace does not exist', async () => {
            prisma.workspace.findUnique.mockResolvedValue(null);

            await expect(
                categoryService.getWorkspaceStructure('workspace-id'),
            ).rejects.toThrow('Workspace not found');

            expect(prisma.category.findMany).not.toHaveBeenCalled();
        });
    });
});
