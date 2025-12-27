import { z } from "zod";

const envSchema = z.object({
  VITE_NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_SERVER_URL: z.url().default("http://localhost"),
  VITE_API_URL: z.url().default("http://localhost/api/v1"),
  VITE_REPLACE_S3_HOST: z.string().optional()
});

const env = envSchema.parse(import.meta.env);

export default env;
