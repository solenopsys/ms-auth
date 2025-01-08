import { integer, sqliteTable, text, unique, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

const datetime = (name: string) => {
  return text(name).$type<Date | string>();
};

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  provider: text('provider'),
  createdAt: datetime('created_at'),
  updatedAt: datetime('updated_at')
});

export const userRelations = relations(users, ({ many }) => ({
  permissions: many(userPermissions),
  accessTokens: many(accessTokens)
}));

export const permissions = sqliteTable('permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  resource: text('resource').notNull(),
  action: text('action').notNull(),
  createdAt: datetime('created_at')
}, (table) => ({
  uniquePermission: unique('idx_permissions_unique').on(table.resource, table.action)
}));

export const permissionRelations = relations(permissions, ({ many }) => ({
  users: many(userPermissions)
}));

export const userPermissions = sqliteTable('user_permissions', {
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  permissionId: integer('permission_id')
    .notNull()
    .references(() => permissions.id, { onDelete: 'cascade' })
}, (table) => ({
  pk: unique('user_permissions_pk').on(table.userId, table.permissionId),
  userIdIdx: index('idx_user_permissions_user_id').on(table.userId)
}));

export const userPermissionRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id]
  }),
  permission: one(permissions, {
    fields: [userPermissions.permissionId],
    references: [permissions.id]
  })
}));

export const accessTokens = sqliteTable('access_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: datetime('expires_at'),
  createdAt: datetime('created_at')
});

export const accessTokenRelations = relations(accessTokens, ({ one }) => ({
  user: one(users, {
    fields: [accessTokens.userId],
    references: [users.id]
  })
}));

// Types for the tables
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshToken = typeof accessTokens.$inferSelect;
export type NewAccessToken = typeof accessTokens.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type UserPermission = typeof userPermissions.$inferSelect;
export type NewUserPermission = typeof userPermissions.$inferInsert;