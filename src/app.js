// this file sets up the Express app, including middleware and routes.

const express = require('express'); // user Express

// ua: cors - для обробки крос-доменних запитів, helmet - для безпеки HTTP заголовків
const cors = require('cors'); // use CORS for cross-origin requests
const helmet = require('helmet'); // use Helmet for security headers
const cookieParser = require('cookie-parser'); // parse cookie headers
const rateLimit = require('express-rate-limit'); // limit repeated requests
const { RedisStore } = require('rate-limit-redis'); // імпорт стор
const { createClient } = require('redis'); // Імпорт клієнт Redis
// ua: імпорт конфігурації - по валідованим змінним енв
const config = require('./config/index'); // load our validated config

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');

const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Redis settings
let redisClient = null;
let store = null;

// Connect to Redis
// ua: Redis активується якщо в .env явно прописано USE_REDIS=true
if (process.env.USE_REDIS === 'true' && config.REDIS_URL) {
  redisClient = createClient({
    url: config.REDIS_URL,
  });

  redisClient.on('error', (err) =>
    console.warn('Redis Client Error:', err.message),
  );

  redisClient
    .connect()
    .then(() => console.log('Redis connected successfully'))
    .catch((err) => console.warn('Redis connection failed:', err.message));

  store = new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  });
}

//  Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Якщо store існує (Redis підключився) — юзається його | інакше — undefined (вбудована пам'ять)
  store: store || undefined,
});

// ua: проксі - для деплою (дає можливість отримувати реальну IP-адресу клієнта)
app.set('trust proxy', 1); // trust first proxy

app.use('/api', limiter);

// ua: базовий захист заголовків та налаштування CSP
app.use(helmet());

app.use(
  cors({
    origin: config.CLIENT_URL, // Whitelist з конфігу
    credentials: true,
  }),
);

app.use(express.json({ limit: '10kb' })); // parse JSON with size limit
app.use(cookieParser(config.COOKIE_SECRET)); // use secret for signed cookies

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// error handling middleware
// ua: глобальний обробник помилок
app.use(errorMiddleware);

module.exports = app;
