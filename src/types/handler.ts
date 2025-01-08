import { Elysia } from "elysia";

export enum HttpMethod {
	GET = "get",
	POST = "post",
	PUT = "put",
	DELETE = "delete",
	PATCH = "patch",
}

export abstract class Handler {
	abstract path: string;
	abstract method: HttpMethod;
	protected jwt: any;

	abstract handle(ctx: any): Promise<any>;

	register(app: Elysia): void {
		// @ts-ignore
		this.jwt = app.jwt;

		
		app[this.method](this.path, (ctx) =>{ 
		//	console.log("context",ctx);
			return this.handle(ctx);
		});

		
	}



}


