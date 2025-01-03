import { Handler, HttpMethod } from "../types/handler";
import { AppleAuthService } from "../services/apple-auth.service";
import { DB } from "../db";

export class AppleAuthHandler extends Handler {
	path = "/auth/apple";
	method = HttpMethod.POST;

	constructor(
		private appleAuth: AppleAuthService,
		private db: DB,
		private jwt: any,
	) {
		super();
	}

	async handle({ body }: any) {
		const { id_token } = body;
		const payload = await this.appleAuth.verifyToken(id_token);

		if (!payload?.email) {
			throw new Error("Invalid token");
		}

		let user = await this.db.findUserByEmail(payload.email);
		if (!user) {
			const userId = await this.db.createUser(
				payload.email,
				null,
				"apple",
				payload.sub,
			);
			user = { id: userId, email: payload.email };
		}

		const token = await this.jwt.sign({
			userId: user.id,
			email: user.email,
		});

		return {
			access_token: token,
			token_type: "Bearer",
			expires_in: 7 * 24 * 60 * 60,
		};
	}
}