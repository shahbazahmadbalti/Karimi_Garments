import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";
import mysql from "mysql2/promise";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>> | null = null;

export function getDb() {
  if (!instance) {
    const pool = mysql.createPool({
      uri: env.databaseUrl,
      ssl: env.databaseUrl.includes("planetscale")
        ? { rejectUnauthorized: true }
        : undefined,
    });
    instance = drizzle(pool, { schema: fullSchema, mode: "default" });
  }
  return instance;
}
