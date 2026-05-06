const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'InfoNest API Documentation',
      version: '1.0.0',
      description: 'Documentation for InfoNest API',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      // ua: Security Definitions - опис схеми авторизації
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // ua: Глобальне застосування авторизації (можна виключити для окремих роутів)
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // ua: шляхи до файлів де будуть прописані коментарі JSDoc
  apis: ['./src/docs/swagger/*.js', './src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
