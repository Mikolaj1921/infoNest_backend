const jwt = require('jsonwebtoken');
const prisma = require('../../src/config/db');

const getAuthToken = async (email = 'test@example.com') => {
    // ua: отримання секретного ключв з процесу (через dotenv-cli)
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
        throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
    }

    // створення юзера
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email,
                name: 'Test Tester',
                password: 'hashed_password_333',
            },
        });
    }

    // генерація токена
    const token = jwt.sign({ id: user.id }, secret, {
        expiresIn: '2h',
    });

    return { token, user };
};

module.exports = { getAuthToken };