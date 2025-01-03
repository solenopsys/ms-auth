import { Handler, HttpMethod } from "../types/handler";
import { DB } from "../db";
import { ClientService } from "../services/client.service";

export class CreateTokenHandler extends Handler {
	path = "/auth/token";
	method = HttpMethod.POST;

	constructor(
		private db: DB,
		private clientService: ClientService,
	) {
		super();
	}

	async handle({ body }: any) {
		const { client_id, client_secret, scope } = body;

		// Проверяем client_id и client_secret
		const client = this.clientService.validateClient(client_id, client_secret);
		if (!client) {
			throw new Error("Invalid client credentials");
		}

		// Проверяем запрошенные scopes
		if (!this.clientService.validateScope(client, scope)) {
			throw new Error("Invalid scope requested");
		}

		const token = crypto.randomUUID();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 30);

		await this.db.createAccessToken(client_id, token, scope, expiresAt);

		return {
			access_token: token,
			token_type: "Bearer",
			expires_in: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
			scope,
		};
	}
}

export class VerifyTokenHandler extends Handler {
	path = "/auth/verify";
	method = HttpMethod.GET;

	constructor(private db: DB) {
		super();
	}

	async handle({ headers }: any) {
		const authHeader = headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			throw new Error("Invalid token");
		}

		const token = authHeader.slice(7);
		const tokenData = await this.db.validateAccessToken(token);

		if (!tokenData) {
			throw new Error("Invalid or expired token");
		}

		return { valid: true, scope: tokenData.scope };
	}
}
