
import { GoogleAuthService } from './services/google-auth.service';
import { GoogleAuthHandler } from './handlers/google-auth.handlers';
import { AppleAuthService } from './services/apple-auth.service';
import { AppleAuthHandler } from './handlers/apple-auth.handlers';
import { CreateTokenHandler } from './handlers/token.handlers';
import {  VerifyTokenHandler } from './handlers/verify.handlers';
import { RegisterHandler } from './handlers/register.handlers';
import { PermissionHandler } from './handlers/permission.handlers'; 

import { RestApp} from './app';
import * as dotenv from 'dotenv';
import { jwt } from '@elysiajs/jwt';
import { DB } from './db';


const start = async ()=>{
  dotenv.config();

  const port = Number(process.env.PORT) || 3000;
  const db = new DB("/db/auth.db");
  await db.init();
  
  const googleHandler = () => {
    const googleAuth = new GoogleAuthService(
      process.env.GOOGLE_CLIENT_ID!
    );
    return new GoogleAuthHandler(googleAuth, db, jwt)
  }
  
  
  const appleHandler = () => {
    const appleAuth = new AppleAuthService(
      process.env.APPLE_CLIENT_ID!,
      process.env.APPLE_TEAM_ID!,
      process.env.APPLE_KEY_ID!,
      process.env.APPLE_PRIVATE_KEY!,
      jwt
    );
  
    return new AppleAuthHandler(appleAuth, db, jwt)
  }
  
  const app = new RestApp(port);
  
  app.addHandler( googleHandler());
  app.addHandler( appleHandler());
  app.addHandler( new CreateTokenHandler(db));
  app.addHandler(  new VerifyTokenHandler(db));

  app.addHandler(new RegisterHandler(db)); 
  app.addHandler(new PermissionHandler(db));
  
  app.start();
}



start();
 



