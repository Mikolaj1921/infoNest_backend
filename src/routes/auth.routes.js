// ua: маршрут для авторизації та аутентифікації користувачів

const express = require('express');
const authController = require('../controllers/auth.controller'); // controller
const validate = require('../middlewares/validate.middleware'); // middleware для валідації
const {
  registerSchema,
  loginSchema,
} = require('../validations/auth.validation'); // схеми валідації

const router = express.Router();

// ua: route реєстрації з zod-валідацією(auth valid)
router.post('/register', validate(registerSchema), authController.register);

// ua: route логіну з zod-валідацією(auth valid)
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
