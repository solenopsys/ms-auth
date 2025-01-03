import { OAuth2Client } from "google-auth-library";


export interface GoogleAuth{
	  verifyToken(token: string): Promise<any>;
}

export class GoogleAuthService implements GoogleAuth{
	private client: OAuth2Client;

	constructor(private clientId: string) {
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
}
