// авто-видалення даних бд (після тестів)

const prisma = require('../src/config/db');

// ua: Очищення таблиць перед кожним тестом
// спочатку дочірні, потім батьківські
// ua: Очищення таблиць перед кожним тестом
beforeEach(async () => {
    // ua: видалення найглибших залежностей
    await prisma.activity.deleteMany();
    await prisma.revision.deleteMany();
    await prisma.file.deleteMany();

    // ua: видалення контенту
    await prisma.document.deleteMany();
    await prisma.category.deleteMany();

    // ua: видалення звязків (Membership)
    await prisma.userWorkspace.deleteMany();

    // ua: видаленя воркспейсів (вони посилаються на юзер як на овнера)
    await prisma.workspace.deleteMany();

    // ua: видалення користувачів (вони посилаються на воркспейс як на овнера)
    await prisma.user.deleteMany();
});

// ua: Закриття з'єднання після всіх тестів
afterAll(async () => {
    await prisma.$disconnect();
});