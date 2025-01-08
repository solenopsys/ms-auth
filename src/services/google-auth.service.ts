import { OAuth2Client } from "google-auth-library";
import jwt, { type SignOptions, type VerifyOptions, type JwtPayload } from "jsonwebtoken";


export class GoogleAuthService {
	private client: OAuth2Client;

	constructor(private clientId: string,		private readonly privateKey: string, ) {
		this.client = new OAuth2Client(clientId);
	}

	async verifyToken(token: string) {
		try {
			const ticket = await this.client.verifyIdToken({
				idToken: token,
				audience: this.clientId,
			});
			return ticket.getPayload();
		} catch (error) {
			throw new Error("Invalid Google token");
		}
	}

	async signToken(payload: JwtPayload): Promise<string> {
		const signOptions: SignOptions = {
			algorithm: "RS256",
			keyid: "1",
			issuer: this.clientId,
			audience: this.clientId,
			expiresIn: "1h",
		};

		return jwt.sign(payload, this.privateKey, signOptions);
	}
}
