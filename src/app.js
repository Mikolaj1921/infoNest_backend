// this file sets up the Express app, including middleware and routes.

// ua: імпорт Express та інших необхідних бібліотек

const express = require('express'); // user Express

// ua: cors - для обробки крос-доменних запитів, helmet - для безпеки HTTP заголовків
const cors = require('cors'); // use CORS for cross-origin requests
const helmet = require('helmet'); // use Helmet for security headers
const cookieParser = require('cookie-parser'); // parse cookie headers
const rateLimit = require('express-rate-limit'); // limit repeated requests
const { redisStore } = require('./config/redis'); // ua: Redis store для лімітеру
const morgan = require('morgan'); // ua: перенесено сюди для цілісності (імпорт Morgan для логування HTTP-запитів)
const logger = require('./utils/logger'); // loger
const config = require('./config/index'); // // ua: імпорт конфігурації - по валідованим змінним енв

// IMPORTS routes

// docs
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
// ---
const healthRoutes = require('./routes/health.routes'); // health check
const authRoutes = require('./routes/auth.routes'); // auth
const workspaceRoutes = require('./routes/workspace.routes'); // workspaces
const categoryRouter = require('./routes/category.routes'); // categories
const documentRouter = require('./routes/document.routes'); // documents
const fileRouter = require('./routes/file.routes'); // files
const searchRoutes = require('./routes/search.routes'); // files
const notificationRoutes = require('./routes/notification.routes'); // notifications
const userRoutes = require('./routes/user.routes'); // users (profile, settings)
// error handling middleware
const errorMiddleware = require('./middlewares/error.middleware');

// create Express app
const app = express();

// ua: налаштування логування HTTP-запитів через Morgan та Winston
// ---
// ua: стрім для передачі логів Morgan у Winston
const stream = {
  write: (message) => logger.info(message.trim()),
};

//  Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Якщо store існує (Redis підключився) — юзається його | інакше — undefined (вбудована пам'ять)
  store: redisStore || undefined,
});

// ua: Морган для логування HTTP-запитів (вимкнено в тестах) та лімітер
if (config.NODE_ENV !== 'test') {
  // ua: використовуємо наш stream, щоб HTTP-запити потрапляли у combined.log
  app.use(
    morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev', { stream }),
  );
  app.use('/api', limiter);
}

// ua: проксі - для деплою (дає можливість отримувати реальну IP-адресу клієнта)
app.set('trust proxy', 1); // trust first proxy
// ua: застосування лімітеру до всіх routes
app.use('/api', limiter);

// ua: базовий захист заголовків та налаштування CSP
app.use(helmet());

// ua: налаштування CORS з використанням клієнтської URL з конфігурації та дозволом на передачу куків
app.use(
  cors({
    origin: config.CLIENT_URL, // Whitelist з конфігу
    credentials: true,
  }),
);

// ua: обмеження розміру JSON payload та використання cookie parser з секретом для підписаних куків
app.use(express.json({ limit: '10kb' })); // parse JSON with size limit
app.use(cookieParser(config.COOKIE_SECRET)); // use secret for signed cookies

//---

// Route for API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/categories', categoryRouter);
app.use('/api/documents', documentRouter);
app.use('/api/files', fileRouter);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// error handling middleware
// ua: глобальний обробник помилок
app.use(errorMiddleware);

module.exports = app;
