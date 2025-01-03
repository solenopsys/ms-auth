import { integer, sqliteTable, text, unique, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

// Кастомный тип для дат
const datetime = (name: string) => {
  return  text(name).$type<Date | string>();
};

// Schema definitions
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  provider: text('provider'),
  createdAt: datetime('created_at'),
  updatedAt: datetime('updated_at')
});

export const accessTokens = sqliteTable('access_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  scope: text('scope').notNull(),
  expiresAt: datetime('expires_at'),
  createdAt: datetime('created_at')
});

export const permissions = sqliteTable('permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resource: text('resource').notNull(),
  action: text('action').notNull(),
  createdAt: datetime('created_at')
}, (table) => ({
  userIdIdx: index('idx_permissions_user_id').on(table.userId),
  uniquePermission: unique('idx_permissions_unique').on(table.userId, table.resource, table.action)
}));

// Types for the tables
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AccessToken = typeof accessTokens.$inferSelect;
export type NewAccessToken = typeof accessTokens.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
