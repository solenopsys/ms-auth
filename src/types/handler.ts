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

	abstract handle(ctx: any): Promise<any>;

	register(app: Elysia): void {
		console.log(this.method, this.path);
		app[this.method](this.path, (ctx) => this.handle(ctx));
	}
}
