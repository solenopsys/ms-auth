import { describe, expect, it } from "bun:test";
 
import { DB } from '../src/db';
import { RestApp } from '../src/app';
import { RegisterHandler } from '../src/handlers/register.handlers';
import { CreateRefreshTokenHandler,CreateBearerTokenHandler } from '../src/handlers/token.handlers';
import { VerifyTokenHandler } from '../src/handlers/verify.handlers';
import { JwtService } from '../src/services/jwt.service';

const jwtService = new JwtService();


import * as dotenv from 'dotenv';
dotenv.config({ path: ".env.test" });


 
import { PermissionHandler } from "../src/handlers/permission.handlers";


const init = async (port: number): Promise<{ app: RestApp, db: DB }> => {
   const app = new RestApp(port);
   const db = new DB(`:memory:`);

   await db.init();

  

   app.addHandler(new RegisterHandler(db));
   app.addHandler( new CreateRefreshTokenHandler(db));
   app.addHandler( new CreateBearerTokenHandler(db,jwtService));
   app.addHandler(new VerifyTokenHandler(db));
   app.addHandler(new PermissionHandler(db));


   app.start();

   return { app, db };
}

const destroy = async (app: RestApp, db: DB) => {
   app.stop();
   db.close();
   // fs.unlinkSync(dbPath);
}


describe('Register by Root', () => {

   it('root secret valid', async () => {
      const ROOT_SECRET = process.env.ROOT_SECRET!
      expect(ROOT_SECRET).toBe("root_secret");
   });

   const registerRoot = async (port: number) => {
      const response = await fetch(`http://localhost:${port}/auth/register/root`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         // client_id, client_secret, root_secret,permissions
         body: JSON.stringify({
            client_id: 'npm-client',
            client_secret: 'npm-client-secret',
            root_secret: 'root_secret',
            permissions: [
               'npm:add',
               'npm:remove',
               'npm:publish'
            ]
         })
      });

      expect(response.status).toBe(200);
      return await response.json();
   }


   it('should register user', async () => {
      const port = 7001;
      const { app, db } = await init(port);
      const data = await registerRoot(port);

      expect(data).toHaveProperty('id');
      destroy(app, db);
   });


   const genToken = async (port: number) => {
      const response = await fetch(`http://localhost:${port}/auth/token/refresh`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            client_id: 'npm-client',
            client_secret: 'npm-client-secret'
         })
      });


      expect(response.status).toBe(200);
      const data = await response.json();
      return data;
   };


   const getBearerToken = async (port: number, refreshToken: string) => {
      const response = await fetch(`http://localhost:${port}/auth/token/bearer`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({ 
            refresh_token: refreshToken
         })
      });


      expect(response.status).toBe(200);
      const data = await response.json();
      return data;
   };


   it('should token valid', async () => {

      const port = 7002;
      const { app, db } = await init(port);

      const data = await registerRoot(port);

      const tockenData = await genToken(port);

      expect(tockenData).toHaveProperty('access_token');
      expect(tockenData).toHaveProperty('token_type', 'Refresh');
      expect(tockenData).toHaveProperty('expires_in');

      const token = tockenData.access_token;

      const response2 = await fetch(`http://localhost:${port}/auth/verify`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`
         }
      });

      expect(response2.status).toBe(200);
      const data2 = await response2.json();
      expect(data2).toHaveProperty('valid', true);
      destroy(app, db);
   });

   it('should bearer token valid', async () => {

      const port = 7004;
      const { app, db } = await init(port);

      const data = await registerRoot(port);

      const tockenData = await genToken(port);

      expect(tockenData).toHaveProperty('access_token');
      expect(tockenData).toHaveProperty('token_type', 'Refresh');
      expect(tockenData).toHaveProperty('expires_in');

      const token = tockenData.access_token;

      const bearerToken = await getBearerToken(port, token);

      expect(bearerToken).toHaveProperty('access_token');
      expect(bearerToken).toHaveProperty('token_type', 'Bearer');
      

      const jwtToken = bearerToken.access_token;

      // Проверяем токен JWT
      const decoded = jwtService.verifyToken(jwtToken ) as any;

      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('permissions');
 
   });

   it('should get user permissions', async () => {
      const port = 7003;
      const { app, db } = await init(port);

      const data = await registerRoot(port);

      const tockenData = await genToken(port);
      const token = tockenData.access_token;

      // 3. Получаем и проверяем permissions
      const permissionsResponse = await fetch(`http://localhost:${port}/auth/permission`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`
         }
      });



      expect(permissionsResponse.status).toBe(200);
      const permissionsData = await permissionsResponse.json();

      // Проверяем структуру ответа
      expect(permissionsData).toHaveProperty('permissions');
      expect(Array.isArray(permissionsData.permissions)).toBe(true);

      // Проверяем наличие всех permissions
      const permissions = permissionsData.permissions;
      expect(permissions).toHaveLength(3);

     
      expect(permissions).toEqual(
         expect.arrayContaining([
            "npm:add",
            "npm:remove",
            "npm:publish"
         ])
      );

    
     

      destroy(app, db);
   });

});