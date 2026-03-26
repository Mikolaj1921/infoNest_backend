const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

router.get('/', async (req, res) => {
  try {
    // ua: перевірка звязку з базою даних
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: 'CONNECTED',
        server: 'RUNNING',
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      services: {
        database: 'DISCONNECTED',
        error: error.message,
      },
    });
  }
});

module.exports = router;
