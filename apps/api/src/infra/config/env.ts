import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(10),
  PORT: z.coerce.number().default(3000),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_PUBLIC_HOST: z.string(),
  S3_BUCKET: z.string(),
  S3_ENDPOINT: z.string()
});

const env = envSchema.parse(process.env);

export default env;
