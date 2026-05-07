// ua: утиліта для логування помилок - used winston для гнучкого log

const winston = require('winston');
const path = require('path');

// ua: формат логування (дата, рівень, повідомлення)
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // записує стек помилки
  winston.format.splat(),
  winston.format.json(),
);

// ua: логер з двома транспортами - один для помилок, інший для всього
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // ua: запис лише помилок у error.log
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
    }),
    // ua: запис абсолютно всього в combined.log
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
    }),
  ],
});

// ua: якщо не в продакшені, дублювання логів в консоль (в кольорі)
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

module.exports = logger;
