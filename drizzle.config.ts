import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: 'sqlite', // или 'turso'
  dbCredentials: {
    url: "auth.db"
  },
} satisfies Config;