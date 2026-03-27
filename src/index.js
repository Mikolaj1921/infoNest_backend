// this is the entry point of the application, it will start the server and connect to the database

//require('dotenv').config(); // load environment variables from .env
const morgan = require('morgan'); // HTTP request logger middleware

const config = require('./config/index'); // load validated config

const app = require('./app'); // load app
const prisma = require('./config/db'); // load database connection

// Use morgan to log requests in 'dev' format (colors and status codes)
// ua: Морган для логування HTTP-запитів у форматі 'dev'
app.use(morgan('dev'));

let server; // variable to store the running server instance

// connect to database and start the server
(async () => {
  try {
    // connect to the database
    await prisma.$connect();
    console.log('Connected to the database successfully');

    // server run
    const PORT = config.PORT || 3000; // use validated port
    server = app.listen(PORT, () => {
      console.log(
        `Server is running in ${config.NODE_ENV} mode on port ${PORT}`,
      );
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1); // exit with fail
  }
})();

// ua: Функція для плавного завершення роботи (Graceful Shutdown)
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown`);

  // ua: таймаут для примусового завершення, якщо щось пыде не так
  const forceExitTimeout = setTimeout(() => {
    console.warn(
      'Could not close connections in time, forcefully shutting down',
    );
    process.exit(1);
  }, 2000);

  if (server) {
    server.close(async () => {
      clearTimeout(forceExitTimeout); // ua: скасування таймаута якщо сервер закрився успішно сам
      console.log('HTTP server closed.');

      await prisma.$disconnect();
      console.log('Database connection closed.');

      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// ua: Слухаємо сигнали завершення процесу (Ctrl+C або системні команди)
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // для локальної розробки
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // для деплою
