import { Handler, HttpMethod } from "../types/handler";
import { type GoogleAuth } from "../services/google-auth.service";
import { DB } from "../db";

export class GoogleAuthHandler extends Handler {
	path = "/auth/google";
	method = HttpMethod.POST;

	constructor(
		private googleAuth: GoogleAuth,
		private db: DB,
		private jwt: any,
	) {
		super();
	}

	async handle({ body }: any) {
		const { id_token } = body;

		// Верифицируем токен, полученный с фронтенда
		const payload = await this.googleAuth.verifyToken(id_token);

		if (!payload?.email) {
			throw new Error("Invalid token");
		}

		let user = await this.db.findUserByEmail(payload.email);
		if (!user) {
			const userId = await this.db.createUser(
				payload.email,
				null,
				"google",
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
