import env from "@api/infra/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@api/infra/database/schema";
import * as relations from "@api/infra/database/relations";

const pool = new Pool({
  connectionString: env.DATABASE_URL
});
export const db = drizzle(pool, { schema: { ...schema, ...relations } });

export type DataBase = typeof db;
