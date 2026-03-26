// this file sets up the Express app, including middleware and routes.

const express = require('express'); // user Express

// ua: cors - для обробки крос-доменних запитів, helmet - для безпеки HTTP заголовків
const cors = require('cors'); // use CORS for cross-origin requests
const helmet = require('helmet'); // use Helmet for security headers
const cookieParser = require('cookie-parser'); // parse cookie headers
const rateLimit = require('express-rate-limit'); // limit repeated requests
// ua: імпорт конфігурації - по валідованим змінним енв
const config = require('./config/index'); // load our validated config

const app = express();

// ua: проксі - для деплою (дає можливість отримувати реальну IP-адресу клієнта)
app.set('trust proxy', 1); // trust first proxy

const healthRoutes = require('./routes/health.routes');
// Middleware

// ua: обмеження кількості запитів (100 за 15 хв) для захисту від Brute-force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
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

// error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong.');
});

module.exports = app;
