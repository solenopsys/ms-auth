import { Database } from "sqlite3";
import { schema } from "./schema";

export class DB {
	private db: Database;

	constructor() {
		this.db = new Database("auth.db");
		this.init();
	}

	private init() {
		this.db.exec(schema);
	}

	async createUser(
		email: string,
		passwordHash?: string | null,
		provider?: string | null,
		providerId?: string | null,
	): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.run(
				`INSERT INTO users (email, password_hash, provider, provider_id) 
         VALUES (?, ?, ?, ?)`,
				[email, passwordHash, provider, providerId],
				function (err) {
					if (err) reject(err);
					resolve(this.lastID);
				},
			);
		});
	}

	async findUserByEmail(email: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.get(
				"SELECT * FROM users WHERE email = ?",
				[email],
				(err, row) => {
					if (err) reject(err);
					resolve(row);
				},
			);
		});
	}

	async createAccessToken(
		userId: number,
		token: string,
		scope: string,
		expiresAt: Date,
	) {
		return new Promise((resolve, reject) => {
			this.db.run(
				`INSERT INTO access_tokens (user_id, token, scope, expires_at)
         VALUES (?, ?, ?, ?)`,
				[userId, token, scope, expiresAt.toISOString()],
				function (err) {
					if (err) reject(err);
					resolve(this.lastID);
				},
			);
		});
	}

	async validateAccessToken(token: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.get(
				`SELECT * FROM access_tokens 
         WHERE token = ? AND expires_at > datetime('now')`,
				[token],
				(err, row) => {
					if (err) reject(err);
					resolve(row);
				},
			);
		});
	}
}
