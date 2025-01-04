import { Handler, HttpMethod } from "../types/handler";
import { DB } from "../db"; 
import { timingSafeEqual } from "crypto";

export class CreateTokenHandler extends Handler {
    path = "/auth/token";
    method = HttpMethod.POST;

    constructor(
        private db: DB
    ) {
        super();
    }

    async handle({ body }: any) {
        try {
            const { client_id, client_secret } = body;

            if (!client_id || !client_secret) {
                throw new Error("Missing client credentials");
            }

            // Проверяем client_id и client_secret в DB
            const user = await this.db.findUserByEmail(client_id);
   

            if (!user) {
                throw new Error("Invalid client credentials");
            }

            // @ts-ignore
            const secretBuffer = Buffer.from(user.passwordHash);
            const validSecretBuffer = Buffer.from(client_secret);

            if (
                secretBuffer.length !== validSecretBuffer.length ||
                !timingSafeEqual(secretBuffer, validSecretBuffer)
            ) {
                throw new Error("Invalid client credentials");
            }

            // Если аутентификация прошла успешно, создаем токен
            const token = crypto.randomUUID();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await this.db.createAccessToken(user.id, token, expiresAt);

            return {
                access_token: token,
                token_type: "Bearer",
                expires_in: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
            };
        } catch (error) {
            // Добавляем обработку ошибок
            console.error('Token creation error:', error);
            throw error;
        }
    }
}