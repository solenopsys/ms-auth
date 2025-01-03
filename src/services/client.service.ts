import { type ClientConfig } from "../types/clients";

// В реальном приложении это должно храниться в базе данных
export const registeredClients: ClientConfig[] = [
	{
		id: "npm-client",
		secret: process.env.NPM_CLIENT_SECRET!, // Секрет должен быть в .env
		name: "NPM Integration",
		scopes: ["read:packages", "write:packages"],
	},
	// Другие клиенты...
];
import { timingSafeEqual } from "crypto";

export class ClientService {
	private clients: Map<string, ClientConfig>;

	constructor() {
		this.clients = new Map(
			registeredClients.map((client) => [client.id, client]),
		);
	}

	validateClient(clientId: string, clientSecret: string): ClientConfig | null {
		const client = this.clients.get(clientId);
		if (!client) return null;

		// Используем timingSafeEqual для предотвращения timing attacks
		const secretBuffer = Buffer.from(clientSecret);
		const validSecretBuffer = Buffer.from(client.secret);

		try {
			if (
				secretBuffer.length === validSecretBuffer.length &&
				timingSafeEqual(secretBuffer, validSecretBuffer)
			) {
				return client;
			}
		} catch {
			// Если длины не совпадают, timingSafeEqual выбросит ошибку
		}

		return null;
	}

	validateScope(client: ClientConfig, requestedScope: string): boolean {
		const requestedScopes = requestedScope.split(" ");
		return requestedScopes.every((scope) => client.scopes.includes(scope));
	}
}
