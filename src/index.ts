
import { GoogleAuthService } from './services/google-auth.service';
import { GoogleAuthHandler } from './handlers/google-auth.handlers';
import { AppleAuthService } from './services/apple-auth.service';
import { AppleAuthHandler } from './handlers/apple-auth.handlers';
import { CreateTokenHandler, VerifyTokenHandler } from './handlers/token.handlers';
import { ClientService } from './services/client.service';
import { RestApp} from './app';
import * as dotenv from 'dotenv';
import { jwt } from '@elysiajs/jwt';
import { DB } from './db';

dotenv.config();

const port = Number(process.env.PORT) || 3000;
const db = new DB("/db/auth.db");

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

const clientService = new ClientService();
app.addHandler( googleHandler());
app.addHandler( appleHandler());
app.addHandler( new CreateTokenHandler(db, clientService));
app.addHandler(  new VerifyTokenHandler(db));



 




app.start();