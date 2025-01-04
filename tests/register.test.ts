import { describe, expect, it, beforeAll, afterAll } from "bun:test";  
import { jwt } from '@elysiajs/jwt';
import { DB } from '../src/db'; 
import { RestApp } from '../src/app'; 
import { RegisterHandler } from '../src/handlers/register.handlers';

import * as dotenv from 'dotenv';
dotenv.config({ path: ".env.test" });
 

import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Database } from "bun:sqlite";

 
const dbName="auth.test.db";

import { unlinkSync } from "node:fs";


describe('Register by Root', () => {
   let app: RestApp;

    beforeAll(async() => {
     const db = new DB(dbName); 
 

   // Это применит все миграции
   await migrate(db.db, { migrationsFolder: "./drizzle" });

     const rh=new RegisterHandler(db);
     app = new RestApp(3001);
     app.addHandler(rh);
     app.start();
   });
 
   afterAll(async() => {
     app.stop();
     // remove 
     unlinkSync(dbName)

   });




   it('root secret valid', async () => {
      const ROOT_SECRET=process.env.ROOT_SECRET!
      expect(ROOT_SECRET).toBe("root_secret");
    });


   it('should register user', async () => {
      const response = await fetch('http://localhost:3001/auth/register/root', {
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
      const data = await response.json();
      
      expect(data).toHaveProperty('id'); 



    });
});