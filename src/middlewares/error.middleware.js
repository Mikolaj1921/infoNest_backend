const config = require('../config');
const { ZodError } = require('zod');

// eslint-disable-next-line
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error(`[ERROR] ${req.method} ${req.url} - ${err.stack}`);

  // обробка для помилок Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',

      errors: err.errors.map((e) => ({
        field: e.path[1] || e.path[0],
        message: e.message,
      })),
    });
  }

  if (config.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.isOperational ? err.message : 'Something went wrong.',
  });
};
