// ua: маршрут для авторизації та аутентифікації користувачів

const express = require('express');
const authController = require('../controllers/auth.controller'); // controller
const validate = require('../middlewares/validate.middleware'); // middleware для валідації
const { protect } = require('../middlewares/auth.middleware'); // middleware для захисту роутів
const {
  registerSchema,
  loginSchema,
} = require('../validations/auth.validation');

const router = express.Router();

// ua: route реєстрації з zod-валідацією(auth valid)
router.post('/register', validate(registerSchema), authController.register);
// ua: route логіну з zod-валідацією(auth valid)
router.post('/login', validate(loginSchema), authController.login);
// ua: оновлення токенів (без валідації, бо токен у кук - захищено від CSRF)
router.post('/refresh', authController.refresh);

// Захищені маршрути (for all - accessToken)
router.use(protect);

// ua: маршрут для виходу з системи
router.post('/logout', authController.logout);

// ua: маршрут для отримання інформації про поточного користувача
router.get('/me', (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
});

module.exports = router;
