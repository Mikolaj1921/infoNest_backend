// init cloudflare r2 client

const { S3Client } = require('@aws-sdk/client-s3');
const config = require('./index');

// ua: setup клієнта для Cloudflare R2
const s3Client = new S3Client({
  region: 'auto', // ua: R2 автo-визначає регіон
  endpoint: config.R2_ENDPOINT,
  credentials: {
    accessKeyId: config.R2_ACCESS_KEY_ID,
    secretAccessKey: config.R2_SECRET_ACCESS_KEY,
  },
});

module.exports = s3Client;
