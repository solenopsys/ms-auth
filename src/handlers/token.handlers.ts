import { Handler, HttpMethod } from "../types/handler";
import { DB } from "../db"; 
import { timingSafeEqual } from "crypto";
import { JwtService, type TokenPayload } from "../services/jwt.service";

export class CreateRefreshTokenHandler extends Handler {
    path = "/auth/token/refresh";
    method = HttpMethod.POST;

    constructor(
        private db: DB,
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

            await this.db.createRefreshToken(user.id, token, expiresAt);

            return {
                access_token: token,
                token_type: "Refresh",
                expires_in: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
            };
        } catch (error) {
            // Добавляем обработку ошибок
            console.error('Token creation error:', error);
            throw error;
        }
    }
}

export class CreateBearerTokenHandler extends Handler {
    path = "/auth/token/bearer";
    method = HttpMethod.POST;

    constructor(
        private db: DB, 
        private tokenService: JwtService,
    ) {
        super();
    }

    async handle({ body }: any) {
        try {
            const { refresh_token } = body;

            if (!refresh_token) {
                throw new Error("Missing client credentials");
            }

          
            const accessToken = await this.db.validateRefreshToken(refresh_token);
            if (!accessToken) {
                throw new Error('Invalid or expired token');
            }
 
            // Получаем permissions для пользователя
            const permissions = await this.db.getUserPermissions(accessToken.userId);


            // Generate JWT token

             
            const token = await this.tokenService.createToken({
                userId: accessToken.userId, permissions: permissions.map(permission => `${permission.resource}:${permission.action}`)
            });
    
            return {
                access_token: token,
              
                token_type: "Bearer", 
            };
           
        } catch (error) {
            // Добавляем обработку ошибок
            console.error('Token creation error:', error);
            throw error;
        }
    }
}