const dotenv = require('dotenv');
const { z } = require('zod');

// load .env
dotenv.config();

// description (validate env variables)
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string().url(),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  SALT_ROUNDS: z.string().transform(Number).default('10'),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  COOKIE_SECRET: z.string().min(16).default('temporary_secret_for_dev_only'),

  //REDIS_URL: z.string().url().optional(),

  // cloudflare r2 config
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2 Access Key is required'),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2 Secret Access Key is required'),
  R2_ENDPOINT: z.string().url('Invalid R2 Endpoint URL'),
  R2_BUCKET_NAME: z.string().min(1, 'R2 Bucket Name is required'),
});

// validate process.env
const envServer = envSchema.safeParse(process.env);

if (!envServer.success) {
  console.error('Invalid environment variables:', envServer.error.format());
  process.exit(1); // stop server if env variables are invalid
}

// export validated env variables
module.exports = envServer.data;
