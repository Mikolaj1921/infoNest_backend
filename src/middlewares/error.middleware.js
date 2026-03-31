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
      // ua: апдейт - дістається назва поля, якщо path[1] нема, береться path[0] або request
      errors: (err.errors || []).map((e) => {
        const fieldName =
          e.path && e.path.length > 1 ? e.path[1] : e.path[0] || 'request';
        return {
          field: fieldName,
          message: e.message,
        };
      }),
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
