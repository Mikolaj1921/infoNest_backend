
const path = require('path');
const prisma = require('../src/config/db');

// ua: перевірка, чи поточний тест є інтеграційним
const isIntegrationTest = () => {
    const testPath = expect.getState().testPath || '';
    return testPath.split(path.sep).includes('integration');
};

// ua: очищення тестової бази перед кожним інтеграційним тестом
beforeEach(async () => {
    if (!isIntegrationTest()) return;

    await prisma.whiteboard.deleteMany();
    await prisma.boardTask.deleteMany();
    await prisma.taskCategory.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.revision.deleteMany();
    await prisma.file.deleteMany();
    await prisma.document.deleteMany();
    await prisma.category.deleteMany();
    await prisma.userWorkspace.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();
});

// ua: відключення Prisma після інтеграційних тестів
afterAll(async () => {
    if (!isIntegrationTest()) return;

    await prisma.$disconnect();
});
