import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Database } from "bun:sqlite";

const sqlite = new Database("auth.db");
const db = drizzle(sqlite);

// Это применит все миграции
await migrate(db, { migrationsFolder: "./drizzle" });