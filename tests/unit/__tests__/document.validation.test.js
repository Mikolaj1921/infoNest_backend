
const {
    createDocumentSchema,
    updateDocumentSchema,
} = require('../../../src/validations/document.validation');

describe('Document Validation Unit Tests', () => {
    // ua: валідний CUID для тестування
    const validCuid = `c${'a'.repeat(24)}`;

    // ua: валідні дані для створення документа
    const validCreateData = {
        body: {
            title: 'Test Document',
            content: 'Test content',
            categoryId: validCuid,
        },
    };

    // ua: валідні дані для оновлення документа
    const validUpdateData = {
        body: {
            title: 'Updated Document',
            content: 'Updated content',
        },
        params: {
            id: validCuid,
        },
    };

    // ua: перевірка схеми створення документа
    describe('createDocumentSchema', () => {
        test('should accept valid document data', () => {
            const result = createDocumentSchema.safeParse(validCreateData);

            expect(result.success).toBe(true);
        });

        test('should trim whitespace from document title', () => {
            const result = createDocumentSchema.safeParse({
                body: {
                    ...validCreateData.body,
                    title: '  Test Document  ',
                },
            });

            expect(result.success).toBe(true);

            if (result.success) {
                expect(result.data.body.title).toBe('Test Document');
            }
        });

        test('should reject empty document title', () => {
            const result = createDocumentSchema.safeParse({
                body: {
                    ...validCreateData.body,
                    title: '',
                },
            });

            expect(result.success).toBe(false);
        });

        test('should reject title containing only whitespace', () => {
            const result = createDocumentSchema.safeParse({
                body: {
                    ...validCreateData.body,
                    title: '     ',
                },
            });

            expect(result.success).toBe(false);
        });

        test('should reject document title longer than 100 characters', () => {
            const result = createDocumentSchema.safeParse({
                body: {
                    ...validCreateData.body,
                    title: 'a'.repeat(101),
                },
            });

            expect(result.success).toBe(false);
        });

        test('should accept document title with exactly 100 characters', () => {
            const result = createDocumentSchema.safeParse({
                body: {
                    ...validCreateData.body,
                    title: 'a'.repeat(100),
                },
            });

            expect(result.success).toBe(true);
        });

        test('should reject missing title', () => {
            const result = createDocumentSchema.safeParse({
                body: {
                    content: 'Test content',
                    categoryId: validCuid,
                },
            });

            expect(result.success).toBe(false);
        });

        test('should reject missing categoryId', () => {
            const result = createDocumentSchema.safeParse({
                body: {
                    title: 'Test Document',
                    content: 'Test content',
                },
            });

            expect(result.success).toBe(false);
        });

        test('should reject invalid categoryId', () => {
            const result = createDocumentSchema.safeParse({
                body: {
                    ...validCreateData.body,
                    categoryId: 'invalid-id',
                },
            });

            expect(result.success).toBe(false);
        });

        test('should accept document data without optional content', () => {
            const result = createDocumentSchema.safeParse({
                body: {
                    title: 'Test Document',
                    categoryId: validCuid,
                },
            });

            expect(result.success).toBe(true);
        });

        test('should reject missing body', () => {
            const result = createDocumentSchema.safeParse({});

            expect(result.success).toBe(false);
        });
    });

    // ua: перевірка схеми оновлення документа
    describe('updateDocumentSchema', () => {
        test('should accept valid document update data', () => {
            const result = updateDocumentSchema.safeParse(validUpdateData);

            expect(result.success).toBe(true);
        });

        test('should accept update with only title', () => {
            const result = updateDocumentSchema.safeParse({
                body: { title: 'Updated title' },
                params: { id: validCuid },
            });

            expect(result.success).toBe(true);
        });

        test('should accept update with only content', () => {
            const result = updateDocumentSchema.safeParse({
                body: { content: 'Updated content' },
                params: { id: validCuid },
            });

            expect(result.success).toBe(true);
        });

        test('should accept update with empty body', () => {
            const result = updateDocumentSchema.safeParse({
                body: {},
                params: { id: validCuid },
            });

            expect(result.success).toBe(true);
        });

        test('should trim whitespace from updated title', () => {
            const result = updateDocumentSchema.safeParse({
                body: { title: '  Updated title  ' },
                params: { id: validCuid },
            });

            expect(result.success).toBe(true);

            if (result.success) {
                expect(result.data.body.title).toBe('Updated title');
            }
        });

        test('should reject empty updated title', () => {
            const result = updateDocumentSchema.safeParse({
                body: { title: '' },
                params: { id: validCuid },
            });

            expect(result.success).toBe(false);
        });

        test('should reject updated title containing only whitespace', () => {
            const result = updateDocumentSchema.safeParse({
                body: { title: '     ' },
                params: { id: validCuid },
            });

            expect(result.success).toBe(false);
        });

        test('should reject updated title longer than 100 characters', () => {
            const result = updateDocumentSchema.safeParse({
                body: { title: 'a'.repeat(101) },
                params: { id: validCuid },
            });

            expect(result.success).toBe(false);
        });

        test('should accept updated title with exactly 100 characters', () => {
            const result = updateDocumentSchema.safeParse({
                body: { title: 'a'.repeat(100) },
                params: { id: validCuid },
            });

            expect(result.success).toBe(true);
        });

        test('should reject invalid document ID', () => {
            const result = updateDocumentSchema.safeParse({
                body: { content: 'Updated content' },
                params: { id: 'invalid-id' },
            });

            expect(result.success).toBe(false);
        });

        test('should reject missing document ID', () => {
            const result = updateDocumentSchema.safeParse({
                body: { content: 'Updated content' },
                params: {},
            });

            expect(result.success).toBe(false);
        });

        test('should reject missing params', () => {
            const result = updateDocumentSchema.safeParse({
                body: { content: 'Updated content' },
            });

            expect(result.success).toBe(false);
        });

        test('should reject missing body', () => {
            const result = updateDocumentSchema.safeParse({
                params: { id: validCuid },
            });

            expect(result.success).toBe(false);
        });
    });
});
