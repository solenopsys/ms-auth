import { Handler, HttpMethod } from "../types/handler";
import { DB } from "../db"; 
export class VerifyTokenHandler extends Handler {
	path = "/auth/verify";
	method = HttpMethod.GET;

	constructor(private db: DB) {
		super();
	}

	async handle({ headers }: any) {

		const authHeader = headers["authorization"];
		if (!authHeader?.startsWith("Bearer ")) {
			throw new Error("Invalid token");
		}

		const token = authHeader.slice(7);
		const tokenData = await this.db.validateAccessToken(token);

		if (!tokenData) {
			throw new Error("Invalid or expired token");
		}

		return { valid: true };
	}
}
