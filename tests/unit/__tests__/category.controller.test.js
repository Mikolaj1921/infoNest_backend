
const categoryService = require('../../../src/services/category.service');
const categoryController = require('../../../src/controllers/category.controller');

jest.mock('../../../src/services/category.service', () => ({
    createCategory: jest.fn(),
    getWorkspaceCategories: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    getWorkspaceStructure: jest.fn(),
}));

describe('Category Controller Unit Tests', () => {
    let req;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {},
            params: {},
            query: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    describe('createCategory', () => {
        test('should successfully create a category', async () => {
            const category = {
                id: 'category-id',
                name: 'Development',
                workspaceId: 'workspace-id',
            };

            req.body = {
                name: 'Development',
                workspaceId: 'workspace-id',
            };

            categoryService.createCategory.mockResolvedValue(category);

            await categoryController.createCategory(req, res);

            expect(categoryService.createCategory).toHaveBeenCalledWith(
                'workspace-id',
                'Development',
            );

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { category },
            });
        });
    });

    describe('getWorkspaceCategories', () => {
        test('should successfully get workspace categories', async () => {
            const result = {
                categories: [
                    { id: 'category-id', name: 'Development' },
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    totalCount: 1,
                    totalPages: 1,
                },
            };

            req.params = { id: 'workspace-id' };
            req.query = { page: '1', limit: '10' };

            categoryService.getWorkspaceCategories.mockResolvedValue(result);

            await categoryController.getWorkspaceCategories(req, res);

            expect(categoryService.getWorkspaceCategories).toHaveBeenCalledWith(
                'workspace-id',
                req.query,
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: result,
            });
        });
    });

    describe('updateCategory', () => {
        test('should successfully update a category', async () => {
            const updatedCategory = {
                id: 'category-id',
                name: 'Updated category',
            };

            req.params = { id: 'category-id' };
            req.body = { name: 'Updated category' };

            categoryService.updateCategory.mockResolvedValue(updatedCategory);

            await categoryController.updateCategory(req, res);

            expect(categoryService.updateCategory).toHaveBeenCalledWith(
                'category-id',
                'Updated category',
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { category: updatedCategory },
            });
        });
    });

    describe('deleteCategory', () => {
        test('should successfully delete a category', async () => {
            req.params = { id: 'category-id' };

            categoryService.deleteCategory.mockResolvedValue({
                id: 'category-id',
            });

            await categoryController.deleteCategory(req, res);

            expect(categoryService.deleteCategory).toHaveBeenCalledWith(
                'category-id',
            );

            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getWorkspaceStructure', () => {
        test('should successfully get workspace structure', async () => {
            const structure = [
                {
                    id: 'category-id',
                    name: 'Development',
                    documents: [
                        { id: 'document-id', title: 'Document 1' },
                    ],
                },
            ];

            req.params = { id: 'workspace-id' };

            categoryService.getWorkspaceStructure.mockResolvedValue(structure);

            await categoryController.getWorkspaceStructure(req, res);

            expect(categoryService.getWorkspaceStructure).toHaveBeenCalledWith(
                'workspace-id',
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: structure,
            });
        });
    });
});
