// авто-видалення даних бд (після тестів)

const prisma = require('../src/config/db');

// ua: Очищення таблиць перед кожним тестом
// спочатку дочірні, потім батьківські
beforeEach(async () => {

    // ua: порядок важливий через FK
    // ua: видаляємо дані у порядку від дочірніх до батьківських таблиць
    await prisma.revision.deleteMany();
    await prisma.file.deleteMany();
    await prisma.document.deleteMany();
    await prisma.category.deleteMany();
    await prisma.userWorkspace.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();


});

// ua: Закриття з'єднання після всіх тестів
afterAll(async () => {
    await prisma.$disconnect();
});