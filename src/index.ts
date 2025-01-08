
import { GoogleAuthService } from './services/google-auth.service';
import { GoogleAuthHandler } from './handlers/google-auth.handlers';
import { AppleAuthService } from './services/apple-auth.service';
import { AppleAuthHandler } from './handlers/apple-auth.handlers';
import { CreateRefreshTokenHandler } from './handlers/token.handlers';
import { CreateBearerTokenHandler } from './handlers/token.handlers';
import {  VerifyTokenHandler } from './handlers/verify.handlers';
import { RegisterHandler } from './handlers/register.handlers';
import { PermissionHandler } from './handlers/permission.handlers'; 

import { RestApp} from './app';
import * as dotenv from 'dotenv'; 
import { DB } from './db';

import { JwtService } from './services/jwt.service';
 
const GOOGLE_SECRET=process.env.GOOGLE_SECRET || "";
const start = async ()=>{
  dotenv.config();

  const port = Number(process.env.PORT) || 3000;
  const db = new DB("/db/auth.db");
  await db.init();
  
  const googleHandler = () => {
    const googleAuth = new GoogleAuthService(
      process.env.GOOGLE_CLIENT_ID!,
      GOOGLE_SECRET
    );
    return new GoogleAuthHandler(googleAuth, db)
  }
  
  
  const appleHandler = () => {
    const appleAuth = new AppleAuthService(
      process.env.APPLE_CLIENT_ID!,
      process.env.APPLE_TEAM_ID!,
      process.env.APPLE_KEY_ID!,
      process.env.APPLE_PRIVATE_KEY! 
    );
  
    return new AppleAuthHandler(appleAuth, db)
  }
  
  const app = new RestApp(port);

  const jwtService = new JwtService();
  
  app.addHandler( googleHandler());
  app.addHandler( appleHandler());
  app.addHandler( new CreateRefreshTokenHandler(db));


  app.addHandler( new CreateBearerTokenHandler(db,jwtService));
  app.addHandler(  new VerifyTokenHandler(db));

  app.addHandler(new RegisterHandler(db)); 
  app.addHandler(new PermissionHandler(db));
  
  app.start();
}



start();
 



