const jwt = require('jsonwebtoken');
const prisma = require('../../src/config/db');
const bcrypt = require('bcryptjs'); // ua: для хешування пароля юзера

const getAuthToken = async (email = 'test@example.com') => {
    // ua: отримання секретного ключв з процесу (через dotenv-cli)
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
        throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
    }

    // створення юзера
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        const hashedPassword = await bcrypt.hash('hashed_password_333', 12);

        user = await prisma.user.create({
            data: {
                email,
                name: 'Test Tester',
                password: hashedPassword,
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