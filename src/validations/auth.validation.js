const { z } = require('zod');

// ua:
// треба потім звірити з схемою призми, щоб не було розбіжностей

// валідація для реєстрації (validation for registration)
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    name: z.string().min(3, 'Username is too short').max(30),
  }),
});

// валідація для логіну (validation for login)
const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});

module.exports = { registerSchema, loginSchema };
