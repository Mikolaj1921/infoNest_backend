const { z } = require('zod');

// ua: Валідація для зміни пароля
const updatePasswordSchema = z.object({
  body: z.object({
    // ua: старий пароль обовязковий для підтв юзера
    oldPassword: z.string().min(1, 'Old password is required'),
    // ua: новий пароль
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .max(100),
  }),
});

module.exports = { updatePasswordSchema };
