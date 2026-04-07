// авто-видалення даних бд (після тестів)

const prisma = require('../src/config/db');

// ua: Очищення таблиць перед кожним тестом
// спочатку дочірні, потім батьківські
beforeEach(async () => {

    await prisma.user.deleteMany();
});

// ua: Закриття з'єднання після всіх тестів
afterAll(async () => {
    await prisma.$disconnect();
});