// Універсальний клас помилки для обробки помилок у додатку

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Визначення статусу
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Позначення помилки як операц
    this.isOperational = true;

    // збереження стека викликів для дебагу
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
