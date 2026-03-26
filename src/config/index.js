const dotenv = require('dotenv');
const { z } = require('zod');

// load .env
dotenv.config();

// description (validate env variables)
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  SALT_ROUNDS: z.string().transform(Number).default('10'),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  COOKIE_SECRET: z.string().min(16).default('temporary_secret_for_dev_only'),
});

// validate process.env
const envServer = envSchema.safeParse(process.env);

if (!envServer.success) {
  console.error('Invalid environment variables:', envServer.error.format());
  process.exit(1); // stop server if env variables are invalid
}

// export validated env variables
module.exports = envServer.data;
