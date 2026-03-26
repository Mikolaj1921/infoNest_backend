// this file sets up the Express app, including middleware and routes.

const express = require('express'); // user Express

// ua: cors - для обробки крос-доменних запитів, helmet - для безпеки HTTP заголовків
const cors = require('cors'); // use CORS for cross-origin requests
const helmet = require('helmet'); // use Helmet for security headers
const config = require('./config/index'); // load validated config
//const routes = require('./routes'); // connect to routes

const app = express();

// ua: проксі - для деплою (дає можливість отримувати реальну IP-адресу клієнта)
app.set('trust proxy', 1); // trust first proxy

// Middleware
app.use(helmet()); // secure app by setting various HTTP headers
app.use(
  cors({
    origin: config.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }),
); // allow requests from frontend and support cookies
app.use(express.json()); // for parsing application/json

// Routes
//app.use('/api', routes);

// error handling middleware
// eslint-disable-next-line
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong.');
});

module.exports = app;
