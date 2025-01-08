import { createSign } from "crypto";
import { JwksClient } from "jwks-rsa";

import jwt, { type SignOptions, type VerifyOptions, type JwtPayload } from "jsonwebtoken";

export class AppleAuthService {
	private jwksClient: JwksClient;

	constructor(
		private readonly clientId: string,
		private readonly teamId: string,
		private readonly keyId: string,
		private readonly privateKey: string, 
	) {
		this.jwksClient = new JwksClient({
			jwksUri: "https://appleid.apple.com/auth/keys",
			cache: true,
			rateLimit: true,
		});
	}

	async verifyToken(token: string) {
		try {
			// Декодируем заголовок токена для получения kid
			const [headerBase64] = token.split(".");
			const header = JSON.parse(
				Buffer.from(headerBase64, "base64url").toString(),
			);

			if (!header.kid) {
				throw new Error("Invalid token format");
			}

			// Получаем публичный ключ Apple по kid
			const key = await this.jwksClient.getSigningKey(header.kid);
			const publicKey = key.getPublicKey();
 

			const verifyOptions: VerifyOptions = {
				algorithms: ["RS256"],
			};

			const decoded = jwt.verify(token, publicKey, verifyOptions);
         
 

			  // Убедимся, что декодированный токен является объектом
			  if (typeof decoded !== "object" || decoded === null) {
				 throw new Error("Decoded token is not an object");
			  }
	  
			  const payload = decoded as JwtPayload;
	  
			  // Проверяем дополнительные claims
			  if (
				 payload.iss !== "https://appleid.apple.com" ||
				 payload.aud !== this.clientId
			  ) {
				 throw new Error("Invalid token claims");
			  }
	  
			  return payload;
			 
		} catch (error) {
			throw new Error("Invalid Apple ID token");
		}
	}

	async signToken(payload: JwtPayload): Promise<string> {
		const signOptions: SignOptions = {
			algorithm: "RS256",
			keyid: "1",
			issuer: this.teamId,
			audience: this.clientId,
			expiresIn: "1h",
		};

		return jwt.sign(payload, this.privateKey, signOptions);
	}

	// Остальные методы без изменений
	generateClientSecret(): string {
		const now = Math.floor(Date.now() / 1000);
		const expirationTime = now + 86400 * 180;

		const claims = {
			iss: this.teamId,
			iat: now,
			exp: expirationTime,
			aud: "https://appleid.apple.com",
			sub: this.clientId,
		};

		const header = {
			alg: "ES256",
			kid: this.keyId,
			typ: "JWT",
		};

		const headerBase64 = Buffer.from(JSON.stringify(header)).toString(
			"base64url",
		);
		const claimsBase64 = Buffer.from(JSON.stringify(claims)).toString(
			"base64url",
		);
		const signature = this.signWithPrivateKey(
			`${headerBase64}.${claimsBase64}`,
			this.privateKey,
		);

		return `${headerBase64}.${claimsBase64}.${signature}`;
	}

	private signWithPrivateKey(data: string, privateKey: string): string {
		const sign = createSign("sha256");
		sign.update(data);
		return sign.sign(privateKey, "base64url");
	}

	async getUserEmail(code: string): Promise<string | null> {
		const clientSecret = this.generateClientSecret();

		const response = await fetch("https://appleid.apple.com/auth/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: this.clientId,
				client_secret: clientSecret,
				code,
				grant_type: "authorization_code",
			}),
		});

		if (!response.ok) {
			throw new Error("Failed to get user email from Apple");
		}

		const data = await response.json();
		const idToken = data.id_token;

		if (!idToken) {
			return null;
		}

		const payload = await this.verifyToken(idToken);
		return payload.email || null;
	}
}
