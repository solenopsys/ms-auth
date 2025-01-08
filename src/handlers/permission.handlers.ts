import { Handler, HttpMethod } from "../types/handler";
import { DB } from "../db"; 




export class PermissionHandler extends Handler {
   path = "/auth/permission";
   method = HttpMethod.GET;

   constructor(private db: DB) {
       super();
   }

   async handle({ headers }: any) {
       try {
           // Проверяем наличие заголовка Authorization
           const authHeader = headers.authorization;
           if (!authHeader ) {
               throw new Error('Missing or invalid authorization header');
           }

           // Получаем токен
           const token = authHeader;
           if (!token) {
               throw new Error('Invalid token format');
           }

           // Проверяем валидность токена и получаем информацию о нём
           const accessToken = await this.db.validateRefreshToken(token);
           if (!accessToken) {
               throw new Error('Invalid or expired token');
           }

           // Получаем permissions для пользователя
           const permissions = await this.db.getUserPermissions(accessToken.userId);

           // Форматируем ответ
           return {
               permissions: permissions.map(permission => `${permission.resource}:${permission.action}`)
           };

       } catch (error) {
           console.error('Permission retrieval error:', error);
           throw error;
       }
   }
}