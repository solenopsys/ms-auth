import { Handler, HttpMethod } from "../types/handler";
import { type GoogleAuthService } from "../services/google-auth.service";
import { DB } from "../db";

export class GoogleAuthHandler extends Handler {
	path = "/auth/google";
	method = HttpMethod.POST;

	constructor(
		private googleAuth: GoogleAuthService,
		private db: DB
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
				"google"
			);
			user = { 
                id: userId,
                email: payload.email,
                provider: "google",
                passwordHash: null,         // добавлено
                createdAt: new Date(),
                updatedAt: new Date(),
            };
		}

		const token = await this.googleAuth.signToken({
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
