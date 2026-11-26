
const {
    createCategorySchema,
    updateCategorySchema,
} = require('../../../src/validations/category.validation');

describe('Category Validation Unit Tests', () => {
    // ua: валідний CUID для тестування
    const validWorkspaceId = 'clh1234567890123456789012';
    const validCategoryId = 'clh2234567890123456789012';

    describe('createCategorySchema', () => {
        test('should accept valid category data', () => {
            const data = {
                body: {
                    name: 'Development',
                    workspaceId: validWorkspaceId,
                },
            };

            const result = createCategorySchema.safeParse(data);

            expect(result.success).toBe(true);
        });

        test('should trim category name', () => {
            const data = {
                body: {
                    name: '  Development  ',
                    workspaceId: validWorkspaceId,
                },
            };

            const result = createCategorySchema.safeParse(data);

            expect(result.success).toBe(true);

            if (result.success) {
                expect(result.data.body.name).toBe('Development');
            }
        });

        test('should reject category name shorter than 3 characters', () => {
            const data = {
                body: {
                    name: 'AB',
                    workspaceId: validWorkspaceId,
                },
            };

            const result = createCategorySchema.safeParse(data);

            expect(result.success).toBe(false);
        });

        test('should reject category name longer than 30 characters', () => {
            const data = {
                body: {
                    name: 'A'.repeat(31),
                    workspaceId: validWorkspaceId,
                },
            };

            const result = createCategorySchema.safeParse(data);

            expect(result.success).toBe(false);
        });

        test('should reject an empty category name', () => {
            const data = {
                body: {
                    name: '',
                    workspaceId: validWorkspaceId,
                },
            };

            const result = createCategorySchema.safeParse(data);

            expect(result.success).toBe(false);
        });

        test('should reject missing category name', () => {
            const data = {
                body: {
                    workspaceId: validWorkspaceId,
                },
            };

            const result = createCategorySchema.safeParse(data);

            expect(result.success).toBe(false);
        });

        test('should reject missing workspace ID', () => {
            const data = {
                body: {
                    name: 'Development',
                },
            };

            const result = createCategorySchema.safeParse(data);

            expect(result.success).toBe(false);
        });

        test('should reject invalid workspace ID', () => {
            const data = {
                body: {
                    name: 'Development',
                    workspaceId: 'invalid-id',
                },
            };

            const result = createCategorySchema.safeParse(data);

            expect(result.success).toBe(false);
        });
    });

    describe('updateCategorySchema', () => {
        test('should accept valid category update data', () => {
            const data = {
                body: {
                    name: 'Updated category',
                },
                params: {
                    id: validCategoryId,
                },
            };

            const result = updateCategorySchema.safeParse(data);

            expect(result.success).toBe(true);
        });

        test('should trim category name', () => {
            const data = {
                body: {
                    name: '  Updated category  ',
                },
                params: {
                    id: validCategoryId,
                },
            };

            const result = updateCategorySchema.safeParse(data);

            expect(result.success).toBe(true);

            if (result.success) {
                expect(result.data.body.name).toBe('Updated category');
            }
        });

        test('should reject category name shorter than 3 characters', () => {
            const data = {
                body: {
                    name: 'AB',
                },
                params: {
                    id: validCategoryId,
                },
            };

            const result = updateCategorySchema.safeParse(data);

            expect(result.success).toBe(false);
        });

        test('should reject category name longer than 30 characters', () => {
            const data = {
                body: {
                    name: 'A'.repeat(31),
                },
                params: {
                    id: validCategoryId,
                },
            };

            const result = updateCategorySchema.safeParse(data);

            expect(result.success).toBe(false);
        });

        test('should reject missing category name', () => {
            const data = {
                body: {},
                params: {
                    id: validCategoryId,
                },
            };

            const result = updateCategorySchema.safeParse(data);

            expect(result.success).toBe(false);
        });

        test('should reject invalid category ID', () => {
            const data = {
                body: {
                    name: 'Updated category',
                },
                params: {
                    id: 'invalid-id',
                },
            };

            const result = updateCategorySchema.safeParse(data);

            expect(result.success).toBe(false);
        });

        test('should reject missing category ID', () => {
            const data = {
                body: {
                    name: 'Updated category',
                },
                params: {},
            };

            const result = updateCategorySchema.safeParse(data);

            expect(result.success).toBe(false);
        });
    });
});
