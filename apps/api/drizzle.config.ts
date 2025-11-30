import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/infra/database",
  schema: "./src/infra/database",
  dialect: "postgresql",
  dbCredentials: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: process.env.DATABASE_URL!
  },
  migrations: {
    table: "__drizzle_migrations",
    schema: "public"
  },
  verbose: true,
  strict: true
});
