import { sql, eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import {
	type User,
	type RefreshToken,
	type Permission,
	type UserPermission
} from './schema';
import {
	users,
	accessTokens,
	permissions,
	userPermissions
} from './schema';

// Database class
export class DB {
	public readonly db!: ReturnType<typeof drizzle>;
	sqlite!: Database;



	constructor(dbPath: string) {
		this.sqlite = Database.open(dbPath);
		this.db = drizzle(this.sqlite);

      // Это применит все миграции
      
	}

	async init(){
		await migrate(this.db, { migrationsFolder: "./drizzle" });
	}

	async createUser(
		email: string,
		passwordHash?: string | null,
		provider?: string | null
	): Promise<number> {
		const result = await this.db.insert(users).values({
			email,
			passwordHash,
			provider
		}).returning({ id: users.id });

		return result[0].id;
	}

	async findUserByEmail(email: string): Promise<User | undefined> {
		const result = await this.db.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		return result[0];
	}

	async createRefreshToken(
		userId: number,
		token: string,
		expiresAt: Date
	): Promise<number> {
		const result = await this.db.insert(accessTokens).values({
			userId,
			token,
			expiresAt: expiresAt.toISOString()
		}).returning({ id: accessTokens.id });

		return result[0].id;
	}

	async validateRefreshToken(token: string): Promise<RefreshToken | undefined> {
		const result = await this.db.select()
			.from(accessTokens)
			.where(sql`${accessTokens.token} = ${token} AND datetime(${accessTokens.expiresAt}) > datetime('now')`)
			.limit(1);

		return result[0];
	}

	async createPermission(
		resource: string,
		action: string
	): Promise<number> {
		const result = await this.db.insert(permissions).values({
			resource,
			action
		}).returning({ id: permissions.id });

		return result[0].id;
	}

	async addPermissionToUser(
		userId: number,
		permissionId: number
	): Promise<void> {
		await this.db.insert(userPermissions).values({
			userId,
			permissionId
		});
	}

	async addPermissionToUserByAction(
		userId: number,
		resource: string,
		action: string
	): Promise<void> {
		// Найдем или создадим permission
		let permission = await this.db.select()
			.from(permissions)
			.where(and(
				eq(permissions.resource, resource),
				eq(permissions.action, action)
			))
			.limit(1)
			.then(res => res[0]);

		if (!permission) {
			const id = await this.createPermission(resource, action);
			permission = { id, resource, action } as Permission;
		}

		await this.addPermissionToUser(userId, permission.id);
	}

	async getUserPermissions(userId: number): Promise<Permission[]> {
		const result = await this.db.select({
			id: permissions.id,
			resource: permissions.resource,
			action: permissions.action,
			createdAt: permissions.createdAt
		})
			.from(userPermissions)
			.innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
			.where(eq(userPermissions.userId, userId));

		return result;
	}

	async checkPermission(
		userId: number,
		resource: string,
		action: string
	): Promise<boolean> {
		const result = await this.db.select()
			.from(userPermissions)
			.innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
			.where(and(
				eq(userPermissions.userId, userId),
				eq(permissions.resource, resource),
				eq(permissions.action, action)
			))
			.limit(1);

		return result.length > 0;
	}

	async removePermissionFromUser(
		userId: number,
		permissionId: number
	): Promise<void> {
		await this.db.delete(userPermissions)
			.where(and(
				eq(userPermissions.userId, userId),
				eq(userPermissions.permissionId, permissionId)
			));
	}

	close(){
		this.sqlite.close();
	}
}