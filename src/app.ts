import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
//import { rateLimit } from 'elysia-rate-limit';
import { Handler } from './types/handler';
export class RestApp {
  app!: Elysia;

  constructor(private port: number) {
    this.init();
    this.initErrors();
  }

  init() {
    this.app = new Elysia()
      .use(swagger())
      .use(cors({
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
      }))
      // Rate limiting
      //.use(rateLimit())
      // JWT настройки
      .use(jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET!
      }));
  }

  initErrors() {
    this.app.onError(({ code, error, set }) => {
      console.error(`[${code}] ${error.message}`);

      switch (code) {
        case 'NOT_FOUND':
          set.status = 404;
          return { error: 'Not Found' };

        case 'VALIDATION':
          set.status = 400;
          return { error: 'Bad Request' };

        //@ts-ignore
        case 'RATE_LIMIT':
          //@ts-ignore
          set.status = 429;
          return { error: 'Too Many Requests' };

        default:
          set.status = 500;
          return { error: 'Internal Server Error' };
      }
    });
  }

  addHandler(handler: Handler) {
    handler.register(this.app)
  }

  async start() {

    await this.app.listen(this.port);
    console.log(
      `🦊 Auth service is running at ${this.app.server?.hostname}:${this.app.server?.port}`
    );

  }

  stop(){
    this.app.stop();
  }

}







