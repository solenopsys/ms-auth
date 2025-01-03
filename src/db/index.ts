 
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { type User, type AccessToken, type Permission } from './schema';
import { users,accessTokens, permissions } from './schema';


// Database class
export class DB {
	private db: ReturnType<typeof drizzle>;
  
	constructor(dbPath: string) {
	  const sqlite = Database.open(dbPath);
	  this.db = drizzle(sqlite);
	}
  
	async createUser(
	  email: string,
	  passwordHash?: string | null,
	  provider?: string | null,
	  providerId?: string | null
	): Promise<number> {
	  const result = await this.db.insert(users).values({
		email,
		passwordHash,
		provider,
		providerId
	  }).returning({ id: users.id });
  
	  return result[0].id;
	}
  
	async findUserByEmail(email: string): Promise<User | undefined> {
	  const result = await this.db.select()
		.from(users)
		.where(sql`${users.email} = ${email}`)
		.limit(1);
	  
	  return result[0];
	}
  
	async createAccessToken(
	  userId: number,
	  token: string,
	  scope: string,
	  expiresAt: Date
	): Promise<number> {
	  const result = await this.db.insert(accessTokens).values({
		userId,
		token,
		scope,
		expiresAt: expiresAt.toISOString()
	  }).returning({ id: accessTokens.id });
  
	  return result[0].id;
	}
  
	async validateAccessToken(token: string): Promise<AccessToken | undefined> {
	  const result = await this.db.select()
		.from(accessTokens)
		.where(sql`${accessTokens.token} = ${token} AND datetime(${accessTokens.expiresAt}) > datetime('now')`)
		.limit(1);
	  
	  return result[0];
	}
  
	async addPermission(
	  userId: number,
	  resource: string,
	  action: string
	): Promise<number> {
	  const result = await this.db.insert(permissions).values({
		userId,
		resource,
		action
	  }).returning({ id: permissions.id });
  
	  return result[0].id;
	}
  
	async getUserPermissions(userId: number): Promise<Permission[]> {
	  return await this.db.select()
		.from(permissions)
		.where(sql`${permissions.userId} = ${userId}`);
	}
  
	async checkPermission(
	  userId: number,
	  resource: string,
	  action: string
	): Promise<boolean> {
	  const result = await this.db.select()
		.from(permissions)
		.where(sql`
		  ${permissions.userId} = ${userId} AND 
		  ${permissions.resource} = ${resource} AND 
		  ${permissions.action} = ${action}
		`)
		.limit(1);
	  
	  return result.length > 0;
	}
  }