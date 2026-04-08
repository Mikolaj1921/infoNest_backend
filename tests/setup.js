// авто-видалення даних бд (після тестів)

const prisma = require('../src/config/db');

// ua: Очищення таблиць перед кожним тестом
// спочатку дочірні, потім батьківські
beforeEach(async () => {

    // ua: порядок важливий через FK
    // ua: видаляємо дані у порядку від дочірніх до батьківських таблиць
    await prisma.userWorkspace.deleteMany(); // зв'язки між користувачами та робочими просторами
    await prisma.category.deleteMany(); // категорії завдань
    await prisma.workspace.deleteMany(); // робочі простори
    await prisma.user.deleteMany(); // користувачі


});

// ua: Закриття з'єднання після всіх тестів
afterAll(async () => {
    await prisma.$disconnect();
});