module.exports = {
    testEnvironment: 'node', // ua: тести запускаються в середовищі Node.js
    testMatch: ['**/tests/**/*.test.js'], // ua: шукає файли з тестами в папці tests, які закінчуються на .test.js
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'], // ua: виконує щоб почистити бд перед кожним тестом
    verbose: true,           // ua: деталі кожного тесту
};